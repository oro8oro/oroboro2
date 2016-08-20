import Oroboro from '../../namespace';
import Groups from '../../groups/groups';
import Items from '../../items/items';
import Group from './Group';
import ItemGroup from './ItemGroup';

class Defs extends Group {
  constructor(doc, parent, fileInst, groups, items) {
    super(doc, parent, fileInst);
    this._query = { 
      defs: true 
    }
  }

  draw() {
    this._svg = this._parent.defs().attr('id', 'ODefs_'+this._file._id);
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


export default Defs;
Oroboro.classes.Defs = Defs;