import opentype from 'opentype.js';

import Oroboro from '../../namespace';
import CubicPath from './CubicPath';

class CubicOpenType extends CubicPath {
  constructor(doc) {
    super(doc);
    this._url = doc.pointList;
    this._text = doc.text;
  }

  draw(parent, multi) {
    let self = this;
    let draw = super.draw;
    opentype.load(this._url, function(err, font) {
      if (err) {
         alert('Font could not be loaded: ' + err);
      } else {
        var path = font.getPath(self._text, 0, 150, 72);
        //console.log(JSON.stringify(path.commands))
        //console.log(JSON.stringify(self.OpenTypeToCubic(path.commands)))

        self._pathArray = self.normalize(
          self.absolutize(
            self.OpenTypeToCubic(path.commands)
        ));
        //console.log(JSON.stringify(self._pathArray))
        draw.call(self, parent, multi);
      }
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
  }
};

export default CubicOpenType;
Oroboro.classes.CubicOpenType = CubicOpenType;

/*
Items.methods.insert.call({
  text: 'Hello, World!',
  pointList: '/fonts/OpenSans-Regular.ttf',
  type: 'CubicOpenType'
});
*/