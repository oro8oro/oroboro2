import Oroboro from '../../namespace';
import Group from './Group';

class ItemGroup extends Group {
  draw() {
    this._svg = this._parent.group().attr('id', 'ItemGroup_'+this._id);
    super.draw();
    return this;
  }

  newItemGroup(doc) {
    this._groups.set(doc._id, new ItemGroup(doc, this._svg, this._file).track().draw());
    return this;
  }

  changedItemGroup(id, fields) {
    this._groups.get(id).refresh(fields);
    return this;
  }

}


export default ItemGroup;
Oroboro.classes.ItemGroup = ItemGroup;