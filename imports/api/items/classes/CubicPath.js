import Oroboro from '../../namespace';
import Bezier from 'bezier-js';
import Item from './Item';
import Path from './Path';

import { paper } from '../../../utils/BooleanOperations';
import * as utils from '../../../utils/svgUtils';
import { spiroToBezier } from '../../../utils/spiro';

const { getAngle, pointByAngleDistance, turnCW, turnCCW, normalize } = utils;

Oroboro.Bezier = Bezier;


class CubicPath extends Path {
  constructor(doc) {
    super(doc);
    let { pathArray } = doc;
    this._pointList = doc.pointList;
    this._pathArray = JSON.parse(pathArray);
  }

  draw(parent, multi) {
    super.draw(parent, multi);
    this.setListeners();
    return this;
  }

  setListeners() {
    let self = this, xi, yi;
    this._svg.on('dragstart', function(e) {
      let { x, y } = this.bbox();
      xi = self.trimDec(x, 3);
      yi = self.trimDec(y, 3);
      self.callListeners('dragstart', e, this, self);
    });
    this._svg.on('dragend', function(e) {
      let {x, y} = this.bbox();
      // Do not run on click
      if(self.trimDec(x, 3) == xi && self.trimDec(y, 3) == yi)
        return;

      self.callListeners('dragend', e, this, self);
      self.mem({ name: 'moveR', up: [ x, y ], down: [ xi, yi ] });
    });
  }

  moveR(x, y) {
    this._svg.move(x, y);
    this._pathArray = this._svg.array().value;
  }

  dmoveR(x, y) {
    this._svg.dmove(x, y);
    this._pathArray = this._svg.array().value;
  }


  clone() {
    // insert in db
    let obj = Object.assign({}, this._doc);
    obj.original = this._id;
    return Item.insert(obj, this._parent);
  }

  update(updateDB=true) {
    this._svg.plot(this._pathArray);
    this._cache = this._svg.node.outerHTML;
    if(updateDB)
      Item.update({ id: this._id, modifier: this.updateModifier() });
  }

  updateModifier() {
    return Object.assign(super.updateModifier(), {
      pathArray: JSON.stringify(this._pathArray),
      cache: this._cache,
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

export default CubicPath;
Oroboro.classes.CubicPath = CubicPath;