// Path classes
if(Meteor.isClient) {
  import SVG from 'svgjs';
  import 'svg.draggy.js';
}
//import normalize from 'normalize-svg-path';
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
    //console.log(JSON.stringify(this._pointList));
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

