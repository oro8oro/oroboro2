import { Tracker } from 'meteor/tracker';
import Oroboro from '../../namespace';
import Groups from '../../groups/groups';
import Items from '../../items/items';
import Common from '../../../utils/Common';
import Item from '../../items/classes/Item';
import '../methods';

class Group extends Common {
  constructor(doc, parent, fileInst, groups, items) {
    super(doc, parent, fileInst);
    this._file = fileInst;
    this._groups = new Map();
    this._items = new Map();
    if(groups)
      groups.forEach(g => {
        this.newItemGroup(g);
      });
    if(items)
      items.forEach(i => {
        this.newItem(i);
      });
 
    this._query = { 
      group: this._id, 
      $or: [ {defs: {$exists: 0}}, {defs: false} ] 
    };
  }

  remove({ db=false }={}) {
    super.remove();
    if(db)
      Groups.methods.remove.call(this._id);
  }

  newItem(doc) {
    let inst = this._file._waitOn.get(doc._id);
    if(inst) {
      this._svg.add(inst._svg);
      inst._parent = this._svg;
    }
    else
      inst = Item.factory(doc, this._svg, this._file).draw()
    this._items.set(doc._id, inst);
    return this;
  }

  removeItem(id) {
    this._items.get(id).remove();
  }

  changedItem(id, fields) {
    this._items.get(id).refresh(fields);
    return this;
  }

  newItemGroup(doc) {
    let inst = this._file._waitOn.get(doc._id);
    if(inst) {
      this._svg.add(inst._svg);
      inst._parent = this._svg;
      inst.track();
    }
    return inst;
  }

  changedItemGroup(id, fields) {
    this._groups.get(id).refresh(fields);
    return this;
  }

  removeItemGroup(id) {
    this._groups.get(id).remove();
  }

  track() {
    this._tracker = Tracker.autorun(() => {
      Groups.find(this._query).observe({
        added: (doc) => {
          this.newItemGroup(doc);
        },
        removed: (doc) => {
          this.removeItemGroup(doc._id);
        }
      });
      Groups.find(this._query).observeChanges({
        changed: (id, fields) => {
          this.changedItemGroup(id, fields);
        }
      });
      Items.find(this._query).observe({
        added: (doc) => {
          this.newItem(doc);
        },
        removed: (doc) => {
          console.log(doc)
          this.removeItem(doc._id);
        }
      });
      Items.find(this._query).observeChanges({
        changed: (id, fields) => {
          this.changedItem(id, fields);
        }
      });
    });
    return this;
  }
}


export default Group;
Oroboro.classes.Group = Group;