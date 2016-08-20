import { Tracker } from 'meteor/tracker';
import Oroboro from '../../namespace';
import Groups from '../../groups/groups';
import CompositeFile from './CompositeFile';
import Item from '../../items/classes/Item';
import Defs from '../../groups/classes/Defs';
import Layer from '../../groups/classes/Layer';
import ItemGroup from '../../groups/classes/ItemGroup';

class SvgFile extends CompositeFile {
  constructor(doc, parent, layers, handleDefs, handleNoDefs) {
    super(doc, parent);
    this._layers = new Map();
    // 
    this._groups = new Map();
    this._items = new Map();
    // Elements created in the client, that will not be recreated on db change
    // Used for chaining (ex. cloning)
    this._waitOn = new Map();
    // Selected elements on canvas (item, group, layer)
    this._selected = new Map();
    // Active Layer
    this._activeLayer = null;
    this._handleDefs = handleDefs;
    this._handleNoDefs = handleNoDefs;

    this.draw();

    if(layers)
      layers.forEach(d => {
        this.newLayer(d);
      });
    else {
      this._query = { 
        file: this._id, 
        $or: [ {defs: {$exists: 0}}, {defs: false} ] 
      };
      this.track();
    }

    // Utility group, for calculating diverse things
    this._tempSvg = this._parent.group().attr('id', 'OUtility');
    // Defs, for hidden definitions
    this._defs = new Defs({}, this._svg, this).draw().track();
  }

  defaults() {
    return {
      width: 1448,
      height: 1024,
    }
  }

  setter(doc) {
    let update = super.setter(doc);
    let { width, height, permissions, title, version } = doc;
    if(width) {
      this._width = width;
      update ++;
    }
    if(height) {
      this._height = height;
      update ++;
    }
    return update;
  }

  draw() {
    this._svg = this._parent.nested()
      .attr('id', 'OCanvas_'+this._id)
      .attr('width', this._width)
      .attr('height', this._height);
    return this;
  }

  waitOn(obj, Class) {
    let inst = new Class(obj, this._svg, this).draw();
    this._waitOn.set(obj._id, inst);
    return inst;
  }

  newLayer(doc) {
    this._layers.set(doc._id, new Layer(doc, this._svg, this).draw().track());
    return this;
  }

  changedLayer(id, fields) {
    this._layers.get(id).refresh(fields);
    return this;
  }

  track() {
    this._tracker = Tracker.autorun(() => {
      if(this._handleNoDefs.ready()) {
        Groups.find(this._query).observe({
          added: (doc) => {
            this.newLayer(doc);
          }
        });
        Groups.find(this._query).observeChanges({
          changed: (id, fields) => {
            this.changedLayer(id, fields);
          }
        });
      }
    });
    return this;
  }

  select(inst) {
    if(inst instanceof Item) {
      this._selected.set('item', inst);
      this._onSelected(this._selected);
    }
    else if(inst instanceof ItemGroup) {
      this._selected.set('group', inst);
      console.log('selected group: ', inst._id);
    }
    else if(inst instanceof Layer) {
      this._selected.set('layer', inst);
      console.log('selected layer: ', inst._id);
    }
    return this;
  }

  onSelected(callb) {
    this._onSelected = callb;
    return this;
  }

  clearSelected() {
    if(this._selected.has('item')) {
      let inst = this._selected.get('item');
      if(inst._listeners.has('unclick'))
        inst.callListeners('unclick');
    }
    this._selected.clear();
    return this;
  }

  setSource(svgSource) {
    console.log(svgSource)
    let group = this._selected.get('group') || this._selected.get('layer');
    // Do not insert if there is nothing selected
    if(!group)
      return;
    let inst = Item.factory({ 
      type: 'CubicPath', closed: true,
      cache: svgSource,
      group: group._id,
    }, this._svg, this);
    this._waitOn.set(inst._id, inst);
    return inst;
  }
}

export default SvgFile;
Oroboro.classes.SvgFile = SvgFile;