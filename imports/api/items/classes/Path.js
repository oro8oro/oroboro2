import Item from './Item';

class Path extends Item {
  // pathList -> cache (svg code)
  constructor(doc, parent, file) {
    super(doc, parent, file);
  }

  defaults() {
    return Object.assign({
      closed: true,
      pathArray: '[]',
      cache: ''
    }, super.defaults());
  }

  setter(doc) {
    let upd = super.setter(doc);
    let { closed, pathArray, palette, selected, locked, cache } = doc;

    if(closed) {
      this._closed = closed;
      upd ++;
    }
    if(pathArray) {
      this._pathArray = JSON.parse(pathArray);
      upd ++;
    }
    if(palette) {
      this._palette = palette;
      upd ++;
    }
    if(selected) {
      this._selected = selected;
      upd ++;
    }
    if(locked) {
      this._locked = locked;
      upd ++;
    }
    if(cache) {
      this._cache = cache;
      upd ++;
    }
    return upd
  }

  update(obj) {
    this._svg.plot(this._pathArray);
    super.update(obj);
  }

  get svg() {
    return this._svg;
  }

  refresh(obj) {
    if(obj.pathArray && JSON.stringify(obj.pathArray) != JSON.stringify(this._pathArray)) {
      this._pathArray = obj.pathArray;
      this.update();
    }
  }

  draw({ draggable=true }={}) {
    let d = (this._pathArray && this._pathArray[0] && this._pathArray[0].length) ? this._pathArray : 'M 0 0';
    this._svg = this._parent.path(d)
      .attr('id', this._id)
      .opacity(0.6)
      .stroke({color: '#000', width:1})
      .fill('#BCBEC0');
    if(draggable)
      this._svg.draggy();
    //this.setListeners();
    return this;
  }

  trim() {
    this._pathArray = this._pathArray.map(point => {
      return point.map((p,i) => {
        if(i)
          return this.trimDec(p);
        return p;
      });
    });
    return this;
  }

  open() {}

  close() {}

  toggleClose() {
    return this;
  }

  toCubic() {}

  pathAlongPath(path2) {}
};

export default Path;
Oroboro.classes.Path = Path;