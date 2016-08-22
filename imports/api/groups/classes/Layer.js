import Oroboro from '../../namespace';
import Group from './Group';
import ItemGroup from './ItemGroup';

class Layer extends Group {
  draw() {
    this._svg = this._parent.group().attr('id', 'Layer_'+this._id);
    this._svg.attr('ordering', this._ordering);
    super.draw();
    return this;
  }

  newItemGroup(doc) {
    let inst = super.newItemGroup(doc) || 
      new ItemGroup(doc, this._svg, this._file).draw().track();
    this._groups.set(doc._id, inst);
    return this;
  }
}


export default Layer;
Oroboro.classes.Layer = Layer;