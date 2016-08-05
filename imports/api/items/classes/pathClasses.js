// Path classes
if(Meteor.isClient) {
  import SVG from 'svgjs';
  import 'svg.draggy.js';
}

import absolutize from 'abs-svg-path';
import Bezier from 'bezier-js';
import Oroboro from '../../namespace';
import Items from '../items';
import '../methods';

import { paper } from '../../../utils/BooleanOperations';
import * as utils from '../../../utils/svgUtils';
import { spiroToBezier } from '../../../utils/spiro';
console.log('unite, subtract, exclude, intersect, divide')
let PathFactory;
const { getAngle, pointByAngleDistance, turnCW, turnCCW, normalize } = utils;

Oroboro.Bezier = Bezier;

PathFactory = (obj, parent) => {
  if(!Oroboro.classes[obj.type])
    throw new Oroboro.Error('undefined-class', `There is no <${obj.type}> class.`);
  if(obj._id)
    return new Oroboro.classes[obj.type](obj);
  return Item.insert(obj, parent);
};

class Item {
  constructor() {
    this._chain = []; //[[funcname, [params]], ]
  }

  getElement(el) {
    if(typeof el == 'string')
      return SVG.get(el) || SVG(el);
    return el;
  }

  static insert(obj, parent) {
    if(obj.cache && !obj.pointList && !obj.pathArray) {
      let res = Item.svgToPathArray(obj.cache, parent);
      //console.log(res)
      obj.pathArray = res.pathArray;
      obj.pointList = res.pointList;
      obj.cache = res.cache;
      obj.closed = res.closed;
      obj.type = 'CubicPath';
    }

    // Be sure we have a valid path
    if(!Item.validate(typeof obj.pathArray == 'string' ? JSON.parse(obj.pathArray) : obj.pathArray))
      return;

    obj.pointList = obj.pointList || '[[]]';
    obj.pathArray = obj.pathArray || '[[]]';
    obj._id = Items.methods.insert.call(obj);
    let item = PathFactory(obj).draw(parent);
    Oroboro.waitOn[obj._id] = item;
    return item;
  }

  static update(obj) {
    Items.methods.update.call(obj);
  }

  // Transform svg source for 
  // line, polyline, polygon, rect, circle, ellipse to path
  static svgToPathArray(source, parent) {
    let tempG = parent.group().svg(source),
      temp = tempG.first(),
      typ = temp.type + 'ToPath',
      pathArray;

    if(utils[typ])
      pathArray = utils[typ](temp);
    else if(temp.type == 'path') {
      pathArray = normalize(absolutize(temp.array().value));
    }

    let tempPath = tempG.path(pathArray),
      pointList = tempPath.attr('d'),
      cache = tempPath.svg(),
      closed = pathArray[pathArray.length-1][0] == 'Z';
    pathArray = JSON.stringify(pathArray);

    tempG.remove();

    return {
      pathArray,
      pointList,
      cache,
      closed
    };
  }

  static validate(pathArray) {
    let notvalid = pathArray.some(p => {
      return p.slice(1).some(po => {
        // Has to be number - we exclude null, undefined
        // NaN is 'number'
        if(!po || (typeof po != 'number'))
          return true;
        // We exclude large numbers, including Infinity
        if(po > Number.MAX_SAFE_INTEGER || po < Number.MIN_SAFE_INTEGER)
          return true;
        return false;
      });
    });
    return !notvalid;
  }
}

class Path extends Item {
  // pathList -> cache (svg code)
  constructor(doc) {
    super();
    this._doc = doc;
    let { _id, closed=true, palette, selected, locked } = doc;
    this._id = _id;
    this._closed = closed;
    this._palette = palette;
    this._selected = selected;
    this._locked = locked;
    this._svg = null;
    this._cache = [];
  }

  get svg() {
    return this._svg;
  }

  draw(parent) {
    //console.log(this._id)
    if(parent)
      this._parent = parent;
    if(!this._svg) {
      this._svg = this.getElement(parent).path(this.getCubic())
        .attr('id', this._id)
        .opacity(0.6)
        .stroke({color: '#000', width:1})
        .fill('#BCBEC0')
        .draggy();
    }
    return this;
  }



  delete() {
    this._svg.remove();
    Meteor.call('items.delete', this._id);
  }

  getCubic() {
    return this._pointList;
  }

  open() {

  }

  close() {

  }

  toggleClose() {
    return this;
  }

  toCubic() {

  }

  pathAlongPath(path2) {

  }
};

class CubicPath extends Path {
  constructor(doc) {
    super(doc);
    let { pathArray } = doc;
    this._pointList = doc.pointList;
    this._pathArray = JSON.parse(pathArray);
  }

  draw(parent) {
    super.draw(parent);
    this.setListeners();
    return this;
  }

  setListeners() {
    let self = this;
    this._svg.on('dragend', function(e) {
      self.spotUpdate();
      self.update();
    });
  }

  move() {
    return this;
  }


  clone() {
    // insert in db
    let obj = Object.assign({}, this._doc);
    obj.original = this._id;
    return Item.insert(obj, this._parent);
    
    /*obj._id = Items.methods.insert.call(obj);
    let clone = PathFactory(obj).draw(this._parent);
    Oroboro.waitOn[obj._id] = clone;
    return clone;*/
  }

  spotUpdate() {
    this._pathArray = this._svg.array().value;
    this._pointList = this._svg.attr('d');
  }

  update() {
    //console.log(JSON.stringify(this._pathArray));
    this._svg.plot(this._pathArray);
    this._cache = this._svg.node.outerHTML;
    this.updateDoc();
  }

  updateDoc() {
    Item.update({ 
      id: this._id,
      modifier: {
        pointList: typeof this._pointList == 'string' ? this._pointList : JSON.stringify(this._pointList),
        pathArray: JSON.stringify(this._pathArray),
        cache: this._cache,
      }
    });
  }

  setItemFromPath(d) {
    let p = this._svg.parent().path(d);
    let item = Item.insert({
      type: 'CubicPath', closed: true,
      pointList: p.attr('d'),
      pathArray: JSON.stringify(p.array().value),
    }, this._svg.parent());
    p.remove();
    return item;
  }

  boolean(path2, type) {
    // TODO: If we receive path2 by id - temporary
    if(typeof path2 == 'string')
      path2 = Oroboro.find(path2);

    // Use Paper.js boolean ops
    paper.setup();
    let d1 = this._svg.attr('d'),
      d2 = path2._svg.attr('d'),
      path1 = new paper.Path(d1),
      boolres = path1[type](new paper.Path(d2));

    if(type != 'divide') {
      return this.setItemFromPath(boolres.exportSVG())
    };
    return boolres._children.map((r, i) => {
      return this.setItemFromPath(r.exportSVG());
    });
  }

  or(path2) {
    return this.boolean(path2, 'unite');
  }

  xor(path2) {
    return this.boolean(path2, 'subtract');
  }

  diff(path2) {
    return this.boolean(path2, 'exclude');
  }

  and(path2) {
    return this.boolean(path2, 'intersect');
  }

  div(path2) {
    return this.boolean(path2, 'divide');
  }

  offsetLine(p1, p2, d) {
    let a1 = getAngle(p1, p2),
        a2 = getAngle(p2, p1),
      seg = [];
    seg.push([ 'L', ...pointByAngleDistance(p1, turnCW(a1, Math.PI/2), d)]);
    seg.push([ 'L', ...pointByAngleDistance(p2, turnCCW(a2, Math.PI/2), d)]);

    return seg;
  }

  linejoin(seg1, seg2, type = 'bevel', inner = true) {
    // miter, round, bevel
    if(inner || type == 'mitter') {
      console.log(JSON.stringify(seg1))
      console.log(JSON.stringify(seg2))
      let p = utils.linesIntersection(
        [ seg1[0].slice(1,3), seg1[1].slice(1,3) ], 
        [ seg2[0].slice(1,3), seg2[1].slice(1,3) ]
      );
      return [seg2[0], ['L', ...p], seg1[1]];
    }
    return seg2.concat(seg1);
  }

  linecap() {
    // butt, round, square
  }

  offset(d1, d2, type) {
    const { _pathArray, _closed} = this;
    let pp = Object.assign([], _pathArray),
      path = [],
      lenP = pp.length,
      curve, len, seg, prev, j;

    if(pp[lenP-1][0] == 'Z')
      pp.pop();

    let last = pp[lenP-1];

    //if(pp[0][0] != pp[length-1][0] || pp[0][1] != pp[length-1][1]) {
    // Add first point, to include the last point in the loop
    //if(_pathArray[lenP-1][0] != 'Z')
    if(_pathArray[lenP-1][0] == 'Z' && 
      _pathArray[lenP-2][0] == 'L' && 
      (
        _pathArray[lenP-2][_pathArray[lenP-2].length-2] != _pathArray[0][1] || 
        _pathArray[lenP-2][_pathArray[lenP-2].length-1] != _pathArray[0][2]
      )
    ) {
      console.log('add point')
      pp.push(['L', pp[0][1], pp[0][2]]);
    }

    console.log(JSON.stringify(pp));

    pp.forEach((p,i) => {
      if(p[0] == 'M' || p[0] == 'Z')
        return;
      //console.log('i: ' + i);
      len = pp[i-1].length;

      if(p[0] == 'L') {
        console.log('L algorithm')
        // Make sure we don't calculate offset perpendiculars on lines 
        // determined by two points with same coordinates;
        // so we find the nearest one with different coords
        j = i;
        prev = [ pp[j-1][len-2], pp[j-1][len-1] ];
        while(prev[0] == p[1] && prev[1] == p[2] && j > 0) {
          j --;
          prev = [ pp[j-1][len-2], pp[j-1][len-1] ];
        }
        //console.log('j: ' + j);


        seg = this.offsetLine(
          [ pp[i-1][len-2], pp[i-1][len-1]],
          [ p[1], p[2] ],
          d1);
      }
      else {
        curve = new Bezier(
          pp[i-1][len-2], pp[i-1][len-1], 
          ...p.slice(1)
        );
        seg = []
        curve.reduce().forEach((curv, k) => {
          curv.offset(d1).forEach((c, j) => {
            let p = this.BezierToPathArray(c);
            if(i == 1 && k == 0 && j == 0)
              seg = seg.concat(p);
            else
              seg.push(p[1]);
          });
        });
      }

      //console.log('seg: ' + JSON.stringify(seg));

      // Hook for linejoin
      if(path.length > 1 && seg.length && seg[0][0] == 'L' && path[path.length-1][0] == 'L') {
        console.log('seg linejoin')
        seg = this.linejoin(
          seg, 
          path.slice(path.length-2), 
          type, d1 > 0);
        path.splice(path.length-2);
      }

      //console.log('seg: ' + JSON.stringify(seg));
      
      path = path.concat(seg);

      console.log('path: ', path.length, JSON.stringify(path))
    });
    //console.log(path[path.length-1][0])
    if(path.length > 1 && path[path.length-1][0] == 'L' && path[path.length-1][0] == 'L' && path[1][0] == 'L') {
      console.log('end')
      seg = this.linejoin(
        [ 
          path[0], 
          path[1]
        ],
        [ 
          path[path.length-2], 
          path[path.length-1]
        ],
        type, d1 > 0);

      path.pop();
      path.splice(0,1, ...seg.slice(1, seg.length-1));

      //console.log(JSON.stringify(path))
    }

    path[0][0] = 'M';
    if(_closed)
      path.push(['Z']);

    console.log(JSON.stringify(path))

    this.setItemFromPath(path);

  }

  BezierToPathArray (curve, offset) {
    offset = offset || { x:0, y:0 };
    var ox = offset.x;
    var oy = offset.y;
    var path = [];
    var p = curve.points, i;
    path.push([ 'M', p[0].x + ox, p[0].y + oy])
    path.push([
      'C',
      p[1].x + ox, p[1].y + oy,
      p[2].x + ox, p[2].y + oy,
      p[3].x + ox, p[3].y + oy
    ]);
    return path;
  }
};

class SimplePath extends CubicPath {
  constructor(doc) {
    super(doc);
    let { pointList, parameters={} } = doc;
    this._pointList = this.pointListToArray(pointList);
    //
    this._transform = parameters.transform ? parameters.transform : 'simple';
  }

  pointListToArray(str) {
    return JSON.parse(str).map(s => {
      return s.map(p => [ parseFloat(p[0]), parseFloat(p[1]) ]);
    });
  }

  get type() {
    return this._transform;
  }

  set type(type) {
    this._transform = type;
    this.update();
  }

  update() {
    this._pathArray = this[this._transform]();
    super.update();
  }

  updateDoc() {
    Item.update({ 
      id: this._id,
      modifier: {
        pointList: JSON.stringify(this._pointList),
        pathArray: JSON.stringify(this._pathArray),
        cache: this._cache,
        parameters: { transform: this._transform },
      }
    });
  }

  spotUpdate() {
    self._pathArray = this._svg.array().value;
    self._pointList = this.getPointList();
  }

  move(dx=0, dy=0) {
    this._pointList = this._pointList.map(subpath => {
      return subpath.map(p => [p[0] + dx, p[1] + dy]);
    });
    this.update();
    return this;
  }

  add(p) {
    const { _pointList } = this;
    _pointList[_pointList.length-1].push(p);
    this.update();
  }

  toCubic() {
    // return CubicPath instance
  }

  simple() {
    const { _pointList, _closed } = this;

    return _pointList.reduce((a,b) => {
      if(!b.length)
        return [];

      // b is a subpat here [[x,y]..]
      return a
        .concat([ [ 'M', b[0][0], b[0][1] ] ])
        .concat(
          b.slice(1)
            .map(p => [ 'L', p[0], p[1] ] )
        )
        .concat(_closed ? [ ['Z'] ] : []);
    }, []);
  }

  spiro() {
    const { _pointList, _closed } = this;
    return this.spiroCoordToPathArray(spiroToBezier(_pointList[0].map(a => {
      return {
          x: a[0],
          y: a[1],
          type: 'g2', // corner, open, open_end, g4, g2
      }
    }), _closed));
  }

  spiroCoordToPathArray(objs) {
    const { _closed } = this;
    if(!objs.length) return [];
    var path = [
        ['M', objs[0].start.x, objs[0].start.y]
    ];
    for(obj of objs) {
        if(obj.c1)
            path.push(['C', obj.c1.x, obj.c1.y, obj.c2.x, obj.c2.y, obj.end.x, obj.end.y]);
        else
            path.push(['L', obj.start.x, obj.start.y,obj.end.x, obj.end.y]);
    }
    if(_closed)
      path.push(['Z']);
    return path;
  }

  algo1() {
    const { _pointList, _closed } = this;
    let dist = 6;

    // TODO
    let objs = _pointList[0];

    if(objs.length < 2)
        return [];

    var a, pp = [{x: objs[0][0], y: objs[0][1]}], path
    for(var i=0; i<objs.length-2; i++) {
        a1 = getAngle(objs[i+2], objs[i])
        a2 = getAngle(objs[i], objs[i+2])
        c1 = pointByAngleDistance(objs[i+1], a1, dist)
        c2 = pointByAngleDistance(objs[i+1], a2, dist)
        pp = pp.concat({x: objs[i+1][0], y: objs[i+1][1], c1: c1, c2: c2})
    }
    pp.push({x: objs[objs.length-1][0], y: objs[objs.length-1][1]})
    if(_closed) {
        // First point
        a1 = getAngle(objs[1], objs[objs.length-1])
        a2 = getAngle(objs[objs.length-1], objs[1])
        pp[0].c1 = pointByAngleDistance(objs[0], a1, dist)
        pp[0].c2 = pointByAngleDistance(objs[0], a2, dist)
        
        // Last point
        a1 = getAngle(objs[0], objs[objs.length-2])
        a2 = getAngle(objs[objs.length-2], objs[0])
        pp[pp.length-1].c1 = pointByAngleDistance(objs[objs.length-1], a1, dist)
        pp[pp.length-1].c2 = pointByAngleDistance(objs[objs.length-1], a2, dist)
    }
    else { 
        // First point
        a1 = getAngle(objs[0], objs[1])
        pp[0].c2 = pointByAngleDistance(objs[0], a1, dist)
        
        // Last point
        a2 = getAngle(objs[objs.length-1], objs[objs.length-2])
        pp[pp.length-1].c1 = pointByAngleDistance(objs[objs.length-1], a2, dist)
    }

    path = [[ 'M', pp[0].x, pp[0].y]]
    for(i=0; i<pp.length-1; i++) {
        path.push([
            'C', 
            pp[i].c2[0], pp[i].c2[1], 
            pp[i+1].c1[0], pp[i+1].c1[1],
            pp[i+1].x, pp[i+1].y
        ]);
    }
    if(_closed)
        path.push([
            'C', 
            pp[pp.length-1].c2[0], pp[pp.length-1].c2[1], 
            pp[0].c1[0], pp[0].c1[1],
            pp[0].x, pp[0].y,
            'Z'
        ])
    return path
  }

  getPointList() {
    const { _pathArray } = this;
    var result = [];
    for(var a in _pathArray){
        if(_pathArray[a][0] == "M"){
            result.push( [ [ _pathArray[a][1], _pathArray[a][2] ] ] );
        }
        else
            if(_pathArray[a][0] == "L"){
                result[result.length-1].push( [ _pathArray[a][1], _pathArray[a][2] ] );
            }
    }
    return result;
  }

  getCubic() {
    return this[this._transform]();
  }
};


export { PathFactory, Item, Path, CubicPath, SimplePath };

// Add to Oroboro namespace, so we can access them in window
let exp = { PathFactory, Item, Path, CubicPath, SimplePath }
Oroboro.classes = Object.assign(Oroboro.classes, exp);

Oroboro.find = (id) => {
  return Oroboro.elem.filter(e => e._id == id)[0];
}

