// Path classes
import SVG from 'svgjs';
//import '../../../utils/svg.draggy.js';

import Oroboro from '../../namespace';
import Items from '../items';
import '../methods';

import { paper } from '../../../utils/BooleanOperations';
import { getAngle, pointByAngleDistance } from '../../../utils/svgUtils';
import { spiroToBezier } from '../../../utils/spiro';
//Oroboro.BooleanOperation = BooleanOperation;
let PathFactory;

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
    if(parent)
      this._parent = parent;
    if(!this._svg) {
      this._svg = this.getElement(parent).path(this.getCubic())
        .attr('id', this._id)
        .opacity(0.6)
        //.draggy();
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
        pointList: JSON.stringify(this._pointList),
        pathArray: JSON.stringify(this._pathArray),
        cache: this._cache,
      }
    });
  }

  boolean(path2, type) {
    if(typeof path2 == 'string')
      path2 = Oroboro.find(path2);
    paper.setup();
    let path1 = new paper.Path(this._svg.attr('d'));
    let boolres = path1[type](new paper.Path(path2._svg.attr('d')));
    if(type != 'divide') {
      let d = boolres.exportSVG();
      return this._svg.parent().path(d).fill('#00B5AD');
    };

    return boolres._children.map((r, i) => {
      let d = r.exportSVG();
      return this._svg.parent().path(d).fill(`#${2*i}${2*i}B5AD`);
    });
  }

  unite(path2) {
    return this.boolean(path2, 'unite');
  }

  subtract(path2) {
    return this.boolean(path2, 'subtract');
  }

  exclude(path2) {
    return this.boolean(path2, 'exclude');
  }

  intersect(path2) {
    return this.boolean(path2, 'intersect');
  }

  divide(path2) {
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

