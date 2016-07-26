// Path classes
import SVG from 'svgjs';
import Oroboro from '../../namespace';
import Items from '../items';
import '../methods';

import { paper } from '../../../utils/BooleanOperations';
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
}

class Path extends Item {
  // pathList -> cache (svg code)
  constructor(doc) {
    super();
    this._doc = doc;
    let { _id, closed, palette, selected, locked } = doc;
    this._id = _id;
    this._closed = closed || false;
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
      this._svg = this.getElement(parent).path(this.getCubic());
    }

    //this._svg.plot()
    return this;
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

  delete() {
    Meteor.call('items.delete', this._id);
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
    this._svg.plot(this._pathArray);
    this._cache = this._svg.node.outerHTML;
  }

  boolean(path2, type) {
    paper.setup();
    let path1 = new paper.Path(this._svg.attr('d'));
    let boolres = path1[type](new paper.Path(path2._svg.attr('d')));
    if(type != 'divide') {
      let d = boolres.exportSVG();
      return this._svg.parent().path(d).fill('#00B5AD');
    };

    boolres._children.forEach((r, i) => {
      let d = r.exportSVG();
      this._svg.parent().path(d).fill(`#${2*i}${2*i}B5AD`);
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
    let { pointList } = doc;
    this._pointList = this.pointListToArray(pointList);
  }

  pointListToArray(str) {
    return JSON.parse(str).map(s => {
      return s.map(p => [ parseFloat(p[0]), parseFloat(p[1]) ]);
    });
  }

  update() {
    this._pathArray = this.getPathArray();
    console.log(JSON.stringify(this._pathArray));
    super.update();
  }

  move(dx=0, dy=0) {
    this._pointList = this._pointList.map(subpath => {
      return subpath.map(p => [p[0] + dx, p[1] + dy]);
    });
    console.log(JSON.stringify(this._pointList));
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

  getPathArray() {
    const { _pointList, _closed } = this;

    return _pointList.reduce((a,b) => {
      let len = b.length-1;

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
    const { _pointList, _closed } = this;
    let path = "";

    _pointList.forEach(p => {
      if(!_closed)
          path = path + "M" + p.join(" ");
      else
          path = path + "M" + p.join(" ") + "Z";
    });
    return path;
  }
};


export { PathFactory, Item, Path, CubicPath, SimplePath };

// Add to Oroboro namespace, so we can access them in window
let exp = { PathFactory, Item, Path, CubicPath, SimplePath }
Oroboro.classes = Object.assign(Oroboro.classes, exp);



