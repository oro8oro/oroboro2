import Item from './Item';

class Path extends Item {
  // pathList -> cache (svg code)
  constructor(doc) {
    super(doc);
    //this._doc = doc;
    this._id = doc._id;
    this._svg = null;
  }

  defaults() {
    return Object.assign({
      closed: true,
      pathArray: '[]',
      cache: ''
    }, super.defaults());
  }

  setter(doc) {
    super.setter(doc);
    let { closed, pathArray, palette, selected, locked, cache } = doc,
      update = 0;

    if(closed) {
      this._closed = closed;
      update ++;
    }
    if(pathArray) {
      this._pathArray = JSON.parse(pathArray);
      update ++;
    }
    if(palette) {
      this._palette = palette;
      update ++;
    }
    if(selected) {
      this._selected = selected;
      update ++;
    }
    if(locked) {
      this._locked = locked;
      update ++;
    }
    if(cache) {
      this._cache = cache;
      update ++;
    }
    return update
  }

  update({ db }={}) {
    this._svg.plot(this._pathArray);
    super.update({ db });
  }

  get svg() {
    return this._svg;
  }

  refresh(obj) {
    if(obj.pathArray && JSON.stringify(obj.pathArray) != JSON.stringify(this._pathArray)) {
      this._pathArray = obj.pathArray;
      this.update(false);
    }
  }

  draw(parent, multi=false) {
    this._parent = this._parent || parent;
    if(!this._svg || multi) {
      let d = (this._pathArray && this._pathArray[0] && this._pathArray[0].length) ? this._pathArray : 'M 0 0';
      this._svg = this.getSvg(parent).path(d)
        .attr('id', this._id)
        .opacity(0.6)
        .stroke({color: '#000', width:1})
        .fill('#BCBEC0')
        .draggy();
    }
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