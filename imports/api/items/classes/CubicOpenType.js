import opentype from 'opentype.js';
import computeLayout from 'opentype-layout';

import Oroboro from '../../namespace';
import CubicPath from './CubicPath';
import Items from '../items';

import { 
  wrapText } from '../../../utils/svgUtils';

class CubicOpenType extends CubicPath {
  constructor(doc, parent, file) {
    super(doc, parent, file);
    let self = this;

    this._OpenType = null;

    // Load the font only one time
    this._promise = new Promise(
      function(resolve, reject) {
        opentype.load(self._url, function(err, font) {
          if (err) {
            alert('Font could not be loaded: ' + err);
          } else {
            resolve(font);
          }
        });
      }
    );
  }

  defaults() {
    return Object.assign({
      font: { size: 10 }
    }, super.defaults());
  }

  setter(doc) {
    let upd = super.setter(doc);
    let { parameters, text, font, pointList } = doc;
    if(parameters) {
      this._url = parameters.url;
      this._width = parameters.width;
      this._height = parameters.height;
      upd ++;
    }
    if(text) {
      this._text = text;
      upd ++;
    }
    if(font) {
      this._font = font;
      upd ++;
    }
    if(pointList) {
      this._pointList = JSON.parse(pointList);
      upd ++;
    }
    return upd;
  }

  draw() {
    //console.log('draw Text', this._text);
    // Draw a default path first
    super.draw({ draggable: !this._indefs });
    this._svg.stroke({width: 0}).fill('#000000');
    //else
    //  this.wrap();
    return this;
  }

  moveR(x, y) {
    this._pointList = [x, y];
    super.moveR(x, y);
    return this;
  }

  dmoveR(x, y) {
    this._pointList = [ this._pointList[0] + x, this._pointList[1] + y ];
    super.dmoveR(x, y);
    return this;
  }

  textToCubic(text, fontSize) {
    let self = this;
    text = text || this._text;
    fontSize = fontSize || this._font.size;
    //console.log(text, fontSize, self._pointList)
    return this._promise.then(function(font) {
      let path = font.getPath(text, self._pointList[0], self._pointList[1], fontSize);
      return self.OpenTypeToCubic(path.commands, false);
    });
  }

  OpenTypeToCubic(array, chain=true) {
    array = array.map(a => {
      let p = [ a.type ];
      if(typeof a.x1 == 'number')
        p.push(this.trimDec(a.x1));
      if(typeof a.y1 == 'number')
        p.push(this.trimDec(a.y1));
      if(typeof a.x2 == 'number')
        p.push(this.trimDec(a.x2));
      if(typeof a.y2 == 'number')
        p.push(this.trimDec(a.y2));
      if(typeof a.x == 'number')
        p.push(this.trimDec(a.x));
      if(typeof a.y == 'number')
        p.push(this.trimDec(a.y));
      return p;
    });

    array = this.normalize(this.absolutize(array));

    if(chain) {
      this._pathArray = array;
      return this;
    }

    return array;
  }

  wrap(w, h, callb) {
    //console.log('wrap', this._width, this._height, w, h, this._text);
    let self = this, _size,
      type='left',
      text = this._text,
      fontSize = this._font.size;
    this._width = w;
    this._height = h;
    this._callback = callb;
    //type = 'center';
    //type = 'right';
    this.textSize(text, fontSize).then(function(size) {
      _size = size;
      return self.wrapToRatio(w/h, text, size, fontSize);
      //return self.wrapToRatio(w, h, text, size, fontSize);
    //}).then(function(paths) {
    }).then(function(res) {
      let { lines, width } = res;
      fontSize = fontSize * w / width;

      //console.log('new fontSize: ', fontSize);

      return Promise.all(lines.map(function(l) {
        return self.textToCubic(l, fontSize).then(function(path) {
          return path;
        });
      }))
    }).then(function(paths) {
      
      let rowh = h/paths.length,
        dy = _size.height*2; // don't know why *2 is needed
      // Move paths - each on the correct row
      // First path is ok, the others have to be moved down
      self._pathArray = paths.map((path) => {
          // Move each point
          path = path.map((p) => {
            return p.map((po,i) => {
              if(i && i%2 == 0)
                return po + dy;
              return po;
            });
          });

          dy += rowh;
          return path;
        }).reduce((a,b) => {return a.concat(b);});
      
        self._svg.plot(self._pathArray);
        if(callb)
          callb();
    });
  }

  // Returns an array of strings (text lines)
  wrapToWidth(w, charW, text) {
    return wrapText(text, charW, w);
  }

  wrapToRatio(ratio, text, size, fontSize) {
    let self = this,
      len = text.length,
      w = size.width,
      hspace = len < 1000 ? (size.height) : (size.height*3/2),
      h = size.height + hspace;
    //console.log('width: ', w);
    // Utopic number of lines of text
    let n = Math.ceil(Math.sqrt(w / (ratio * h))),
      // Utopic width of a text line
      w2 = w/n,
      charW = w / len,
      // True lines of text at the utopic width
      lines = this.wrapToWidth(w2, charW, text);

    //console.log(n, lines.length, w2)
    //console.log(JSON.stringify(lines));

    // Text is wrapped in the specified ratio
    if(n != lines.length) {

      // Ratio: Initial width and the total utopic width
      let r = w / (w2 * lines.length);
      //console.log(r)

      if(!fontSize)
        this._font.size = this._font.size*r-2;
      fontSize = fontSize ? (fontSize * r-2) : this._font.size;

      lines = this.wrapToWidth(w2-20, charW * r, text);
    }

    return { lines, width: w2 };
  }

  textSize(text, fontSize) {
    let self = this;
    return this.textToCubic(text, fontSize).then(function(path) {
      let p = self._file._tempSvg.path(path);
      let { width, height } = p.bbox();
      p.remove();
      return { width, height };
    });
  }

  text(text, w, h, callb) {
    if(!text)
      return this._text;
    this._text = text;
    this.wrap(w || this._width, h || this._height, callb || this._callback);
    this.rawUpdate({ text });
    return this;
  }
};

export default CubicOpenType;
Oroboro.classes.CubicOpenType = CubicOpenType;

Oroboro.api.addCaption = (text, file, group) => {
  file = file || (Oroboro.inEdit ? Oroboro.inEdit._id : null);
  if(!file)
    return;
  let inst = Oroboro.files.get(file);
  group = group || 
    (inst._selected.has('group') ? inst._selected.get('group')._id : null) || 
    (inst._selected.has('layer') ? inst._selected.get('layer')._id : null);
  if(!group)
    return;
  let obj = {
    type: 'CubicOpenType',
    text,
    group: group._id,
    pointList: '[200,900]',
    parameters: {
      url: '/fonts/FiraSansOT-Medium.otf',
      width: 1024,
      height: 200,
    },
  }
  obj._id = Items.methods.insert.call({ obj, fileId: file });
  //return inst.waitOn(obj, CubicOpenType);
}

/*
Items.methods.insert.call({
  text: 'Hello, World!',
  pointList: '/fonts/OpenSans-Regular.ttf',
  type: 'CubicOpenType'
});
*/