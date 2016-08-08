import Oroboro from '../../namespace';
import '../methods';
import Item from './Item';

if(Meteor.isClient) {
  import SVG from 'svg.js';
  import 'svg.draggy.js';
}
import absolutize from 'abs-svg-path';
import Bezier from 'bezier-js';

import { paper } from '../../../utils/BooleanOperations';
import * as utils from '../../../utils/svgUtils';
import { spiroToBezier } from '../../../utils/spiro';

const { getAngle, pointByAngleDistance, turnCW, turnCCW, normalize } = utils;

Oroboro.Bezier = Bezier;


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
    this._cache = '';
  }

  get svg() {
    return this._svg;
  }

  draw(parent) {
    if(parent)
      this._parent = parent;
    if(!this._svg) {
      this._svg = this.getSvg(parent).path(this.getCubic())
        .attr('id', this._id)
        .opacity(0.6)
        .stroke({color: '#000', width:1})
        .fill('#BCBEC0')
        .draggy();
    }
    return this;
  }



  remove() {
    this._svg.remove();
    Item.remove(this._id);
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
    let self = this, ini;
    this._svg.on('dragstart', function(e) {
      ini = JSON.parse(JSON.stringify(this.array().value));
      self.callListeners('dragstart', e, this, self);
    });
    this._svg.on('dragend', function(e) {
      setChron(JSON.parse(JSON.stringify(ini)));
      ini = null;
      self.callListeners('dragend', e, this, self);
    });

    function setChron(pathArray) {
      self.chronology(
        function() {
          self.spotUpdate();
        },
        function() {
          self.spotUpdate(pathArray);
        });
      return;
    }
  }

  move() {
    return this;
  }


  clone() {
    // insert in db
    let obj = Object.assign({}, this._doc);
    obj.original = this._id;
    return Item.insert(obj, this._parent);
  }

  spotUpdate(pathArray) {
    this._pathArray = pathArray || this._svg.array().value;
    this._pointList = this.getPointList();
    this.update();
  }

  getPointList() {
    return this._svg.attr('d');
  }

  update() {
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

  booleanWrap(path2, type) {
    // TODO: If we receive path2 by id - temporary
    if(typeof path2 == 'string')
      path2 = Oroboro.find(path2);

    return this.boolean(this._svg.attr('d'), path2._svg.attr('d'), type);
  }

  boolean(d1, d2, type) {
    // Use Paper.js boolean ops
    paper.setup();

    //path1 = new paper.Path(d1),
    //  boolres = path1[type](new paper.Path(d2));
    path1 = new paper.CompoundPath(d1),
      boolres = path1[type](new paper.CompoundPath(d2));

    if(type != 'divide') {
      return this.setItemFromPath(boolres.exportSVG())
    };
    return boolres._children.map((r, i) => {
      return this.setItemFromPath(r.exportSVG());
    });
  }

  or(path2) {
    return this.booleanWrap(path2, 'unite');
  }

  xor(path2) {
    return this.booleanWrap(path2, 'exclude');
  }

  diff(path2) {
    return this.booleanWrap(path2, 'subtract');
  }

  and(path2) {
    return this.booleanWrap(path2, 'intersect');
  }

  div(path2) {
    return this.booleanWrap(path2, 'divide');
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

  strokeToPath(d, type) {
    if(!d)
      d = parseFloat(this._svg.attr('stroke-width'));
    let path1, path2, d1 = [], d2 = [];

    this.separate(this._pathArray)
      .forEach(subPathArray => {
        d1 = d1.concat(this.offsetPath(subPathArray, d, type));
        d2 = d2.concat(this.offsetPath(subPathArray, -d, type));
      });

    path1 = this._svg.parent().path(d1);
    path2 = this._svg.parent().path(d2);
    d1 = path1.attr('d');
    d2 = path2.attr('d');

    path1.remove();
    path2.remove();
    return this.boolean(d1, d2, 'exclude');
  }

  offset(d1, type) {
    let subP = [];
    this.separate(this._pathArray)
      .forEach(subPathArray => {
        subP = subP.concat(this.offsetPath(subPathArray, d1, type));
      });
    return this.setItemFromPath(subP);
  }

  // Returns the subPathArrays
  separate(pathArray) {
    let subpaths = [], i=-1;
    pathArray.forEach(p => {
      if(p[0] == 'M') {
        subpaths.push([]);
        i++;
      }
      subpaths[i].push(p);
    });
    return subpaths;
  }

  offsetPath(_pathArray, d1, type) {
    const { trimDec } = this;
    //console.log(JSON.stringify(_pathArray));
    let pp = Object.assign([], _pathArray),
      path = [],
      lenP = pp.length,
      inner = d1 < 0,
      curve, seg, prev, j,
      _closed;

    if(pp[lenP-1][0] == 'Z') {
      pp.pop();
      _closed = true;
    }

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
      pp.push(['L', pp[0][1], pp[0][2]]);
    }

    pp.forEach((p,i) => {
      if(p[0] == 'M' || p[0] == 'Z')
        return;

      if(p[0] == 'L') {
        let len = pp[i-1].length,
          prev = [ pp[i-1][len-2], pp[i-1][len-1]];

        // Make sure we don't calculate offset perpendiculars on lines 
        // determined by two points with same coordinates;
        if(trimDec(prev[0]) == trimDec(p[1]) && trimDec(prev[1]) == trimDec(p[2]))
          return;

        seg = this.offsetLine(
          prev,
          [ p[1], p[2] ],
          d1);
      }
      else {
        let len = pp[i-1].length;
        curve = new Bezier(
          pp[i-1][len-2], pp[i-1][len-1], 
          ...p.slice(1)
        );
        seg = []
        curve.reduce().forEach((curvv, k) => {
          curvv.reduce().forEach((curv, k) => {
            curv.offset(d1).forEach((c, j) => {
              let p = this.BezierToPathArray(c);
              if(i == 1 && k == 0 && j == 0)
                seg = seg.concat(p);
              else
                seg.push(p[1]);
            });
          });
        });
      }

      // Hook for linejoin
      if(path.length > 1 && seg.length && seg[0][0] == 'L' && path[path.length-1][0] == 'L') {
        //console.log('seg linejoin')
        seg = this.linejoin(
          seg, 
          path.slice(path.length-2), 
          type, inner);
        path.splice(path.length-2);
      }
      
      path = path.concat(seg);

      //console.log('path: ', path.length, JSON.stringify(path))
    });
    //console.log(path[path.length-1][0])
    if(path.length > 1 && path[path.length-1][0] == 'L' && path[path.length-1][0] == 'L' && path[1][0] == 'L') {
      //console.log('end')
      seg = this.linejoin(
        [ 
          path[0], 
          path[1]
        ],
        [ 
          path[path.length-2], 
          path[path.length-1]
        ],
        type, inner);

      path.pop();
      path.splice(0,1, ...seg.slice(1, seg.length-1));

      //console.log(JSON.stringify(path))
    }

    path[0][0] = 'M';
    if(_closed)
      path.push(['Z']);

    //console.log(JSON.stringify(path))

    return path;

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


export { Path, CubicPath, SimplePath };

// Add to Oroboro namespace, so we can access them in window
let exp = { Path, CubicPath, SimplePath }
Oroboro.classes = Object.assign(Oroboro.classes, exp);

Oroboro.find = (id) => {
  return Oroboro.elem.filter(e => e._id == id)[0];
}

