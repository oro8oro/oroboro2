import absolutize from 'abs-svg-path';

import Oroboro from '../../namespace';
import Common from '../../../utils/Common';
import Items from '../items';
import ItemFactory from '../ItemFactory';
import * as utils from '../../../utils/svgUtils';

import '../methods';

class Item extends Common {
  constructor(doc) {
    super(doc)
    this._listeners = {
      click: [],
      dragstart: [],
      dragmove: [],
      dragend: []
    };
  }

  static insert(obj, parent) {
    if(obj.cache && !obj.pointList && !obj.pathArray) {
      let res = Item.svgToPathArray(obj.cache, parent);
      //console.log(res)
      obj.pathArray = res.pathArray;
      obj.pointList = res.pointList;
      obj.cache = res.cache;
      obj.closed = res.closed;
      obj.type = obj.type || 'CubicPath';
    }

    obj.pointList = obj.pointList || '[[]]';
    obj.pathArray = obj.pathArray || '[[]]';

    // Be sure we have a valid path
    if(!Item.validate(typeof obj.pathArray == 'string' ? JSON.parse(obj.pathArray) : obj.pathArray))
      return;

    obj._id = Items.methods.insert.call(obj);
    let item = ItemFactory(obj).draw(parent);
    Oroboro.waitOn[obj._id] = item;
    return item;
  }

  static update(obj) {
    Items.methods.update.call(obj);
  }

  static delete(id) {
    Item.methods.delete.call(id);
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
        if(typeof po != 'number' || (!po && po != 0))
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

export default Item;
Oroboro.classes.Item = Item;