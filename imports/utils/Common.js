if(Meteor.isClient) {
  import SVG from 'svg.js';
  import 'svg.draggy.js';
}

class Common {
  constructor(doc, parent, file) {
    this._id = doc._id;
    // Set defaults
    this.setter(this.defaults());
    // Set actual data
    this.setter(doc);

    this._listeners = new Map();

    if(parent) {
      if(this._indefs && this._defs)
        this._parent = this._defs;
      else
        this._parent = this.getSvg(parent);
    }
    if(file)
      this._file = file;
  }

  defaults() {
    return {
      mem: {
        chain: '[]',
        index: -1
      },
      defs: false
    }
  }

  setter(doc) {
    let { mem, defs, ordering } = doc,
      upd = 0;

    // History
    if(mem) {
      if(mem.chain)
        this._mem = JSON.parse(mem.chain);
      // Index of last valid action
      // Actions after it are "redos"
      // Actions before it are "undos"
      if(mem.index)
        this._memI = mem.index;
      upd ++;
    }
    if(defs) {
      this._indefs = defs;
      upd ++;
    }
    if(ordering) {
      this._ordering = ordering;
      upd ++;
    }
    return upd;
  }

  // We receive the db object after a fresh update 
  refresh(obj) {
    let updates = this.setter(obj);
    console.log('refresh')
    if(updates)
      this.update();
  }

  remove() {
    this._svg.remove();
  }

  draw() {
    this.setListeners();
  }

  get tempSvg() {
    return this._tempSvg;
  }

  getSvg(el) {
    if(typeof el == 'string')
      return SVG.get(el) || SVG(el);
    return el;
  }

  trimDec(no, dec=3) {
    return parseFloat(no.toFixed(dec));
  }


  // Function name and do/undo parameters
  // update database or not
  mem({ name, up=[], down=[], run=true, update=true }) {
    // Clear all further redos
    this._mem.splice(this._memI+1);

    // Add action
    this._mem.push({
      name,
      up,
      down,
      timestamp: new Date(),
    });

    // Increment index
    this._memI ++;

    // Run the "do" function +/- update (updates the db)
    if(run) {
      this[name](...up);
      this.update({ db: update });
    }
  }

  undo({ update=true }={}) {
    // Get last action that can be undone and decrease index
    let act = this._mem[this._memI --];
    this[act.name](...act.down);
    this.update({ db: update });
    return this;
  }

  redo({ update=true }={}) {
    // Increase index and get first action that can be redone
    let act = this._mem[++ this._memI];
    this[act.name](...act.up);
    this.update({ db: update });
    return this;
  }


  showMem() {
    window.open('/history/item/'+this._id, '_blank');
    return this;
  }

  updateModifier() {
    return {
      mem: {
        chain: JSON.stringify(this._mem),
        index: this._memI,
      }
    };
  }

   listen(type, func) {
    if(!this._listeners.has(type))
      this._listeners.set(type, []);
    this._listeners.get(type).push(func);
    this._svg.on(type, (e) => {
      this.callListeners(type, e);
    });
  }

  callListeners(type, event) {
    this._listeners.get(type).forEach(f => {
      f(event);
    });
  }

  setListeners() {
    this.listen('click', (e) => {
      this._file.select(this);
    });
  }

  // Common functions for all elements
  move(x, y) {
    let bbox = this._svg.bbox();
    this.mem({ name: 'moveR', up: [ x, y ], down: [ bbox.x, bbox.y ] });
    return this;
  }

  dmove(x, y) {
    this.mem({ name: 'dmoveR', up: [ x, y ], down: [ -x, -y ] });
    return this;
  }

  palette(args) {
    this.mem({ name: 'paletteR', up: [ args ], down: [ this.palette ] });
    return this;
  }

  // Should be implemented by each specific class
  moveR(x, y) {}
  dmoveR(x, y) {}
  paletteR(args) {}
}


export default Common;