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
      font: { size: 26 }
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

  /*textToCubic(text, fontSize) {
    let self = this;
    text = text || this._text;
    fontSize = fontSize || this._font.size;
    //console.log(text, fontSize, self._pointList)
    return this._promise.then(function(font) {
      let path = font.getPath(text, self._pointList[0], self._pointList[1], fontSize);
      return self.OpenTypeToCubic(path.commands, false);
    });
  }*/

  /*OpenTypeToCubic(array, chain=true) {
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
  }*/

  mdrawText(font) {
    let ndx = 0
    let prev = [300]
    let dg = this.drawText(font)

    while(!dg){
      ndx = ndx + 1
      if (prev[0] == this._font.size) return true
      prev[ndx%2] = this._font.size
      dg = this.drawText(font)
      
    }
  }

  drawText(font){
    let text = this._text, pt = [],
      box = { 
        width: this._width, 
        height: this._height,
        x1: this._pointList[0],
        y1: this._pointList[1],
        x2: this._pointList[0] + this._width,
        y2: this._pointList[1] + this._height
      },
      scale = 1 / font.unitsPerEm * this._font.size,
      // Layout some text - notice everything is in em units!
      result = computeLayout(font, text, {
        lineHeight: 1.2 * font.unitsPerEm, // '2.5em' in font units
        width: box.width / scale, // '500px' in font units
        align: "center"
      });
    console.log(JSON.stringify(box));
    for (ndx in result.glyphs){
      if (0-result.glyphs[ndx].position[1]*scale+box.y1 > box.y2) {
        this._font.size = this._font.size - 1
        return false
      }
      
      pt[ndx] = result.glyphs[ndx].data.getPath(result.glyphs[ndx].position[0]*scale+box.x1,0-result.glyphs[ndx].position[1]*scale+box.y1,this._font.size).toPathData(1);

    }
    if (0-result.glyphs[ndx].position[1]*scale+box.y1 < box.y2 - 50) {
        this._font.size = this._font.size + 1
        return false
      }
    console.log('this._font.size', this._font.size)
    //console.log(pt);
    return pt;
  }

  wrap(w, h, callb) { 
    let self = this;
    this._width = w;
    this._height = h;
    this._callback = callb;
    this._promise.then(function(font) {
      let path = self.mdrawText(font);
      //console.log(path);
      //self._pathArray = 
      //self._svg.plot(self._pathArray);
      if(path)
        self._svg.plot(path.join(' '));
      if(callb)
        callb();
      //console.log(self._svg)
    });
  }

  /*text(text, w, h, callb) {
    if(!text)
      return this._text;
    this._text = text;
    this.wrap(w || this._width, h || this._height, callb || this._callback);
    this.rawUpdate({ text });
    return this;
  }*/
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