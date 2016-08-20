import absolutize from 'abs-svg-path';

import Oroboro from '../../namespace';
import Common from '../../../utils/Common';
import Items from '../items';
import * as utils from '../../../utils/svgUtils';

import '../methods';

class Item extends Common {
  constructor(doc, parent, file) {
    super(doc, parent, file);
  }

  setter(doc) {
    let update = super.setter(doc);
    let { group } = doc;
    if(group) {
      this._group = group;
      update ++;
    }
    return update;
  }

  update({ db=false, modifier={} }={}) {
    this._cache = this._svg.node.outerHTML;
    //console.log('update db: ', db)
    if(db) {
      Items.methods.update.call({ id: this._id, modifier: Object.assign(modifier, this.updateModifier())});
      console.log('item db updated')
    }
  }

  rawUpdate(modifier) {
    Items.methods.update.call({ id: this._id, modifier });
  }

  remove({ db=false }={}) {
    super.remove();
    if(db)
      Items.methods.remove.call(this._id);
  }

  clone(groupId) {
    let obj = Items.methods.clone.call(this._id, groupId);
    if(parent) {
      let item = Item.factory(obj, parent).draw();
      Oroboro.waitOn[obj._id] = item;
      return item;
    }
  }

  static insert(obj, parent, file) {
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
    obj._id = Items.methods.insert.call({ obj, fileId: file._id });
    if(parent) {
      let item = Item.factory(obj, parent, file).draw();
      return item;
    }
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

  static factory(obj, parent, file) {
    if(!Oroboro.classes[obj.type])
      throw new Oroboro.Error('undefined-class', `There is no <${obj.type}> class.`);
    if(obj._id)
      return new Oroboro.classes[obj.type](obj, parent, file);
    return Item.insert(obj, parent, file);
  }
}

export default Item;
Oroboro.classes.Item = Item;