import Item from './Item';

class Path extends Item {
  // pathList -> cache (svg code)
  constructor(doc) {
    super(doc);
    this._doc = doc;
    let { _id, closed=true, pathArray, palette, selected, locked } = doc;
    this._id = _id;
    this._pathArray = JSON.parse(pathArray || '[]');
    this._closed = closed;
    this._palette = palette;
    this._selected = selected;
    this._locked = locked;
    this._svg = null;
    this._cache = '';
  }

  get svg() {
    return this._svg;
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

  remove() {
    this._svg.remove();
    Item.remove(this._id);
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