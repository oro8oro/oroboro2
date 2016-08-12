import Oroboro from '../namespace';
import Item from './classes/Item';
import './classes/CubicPath';
import './classes/SimplePath';

const ItemFactory = (obj, parent) => {
  if(!Oroboro.classes[obj.type])
    throw new Oroboro.Error('undefined-class', `There is no <${obj.type}> class.`);
  if(obj._id)
    return new Oroboro.classes[obj.type](obj);
  return Item.insert(obj, parent);
};

export default ItemFactory;

Oroboro.find = (id) => {
  return Oroboro.elem.filter(e => e._id == id)[0];
}