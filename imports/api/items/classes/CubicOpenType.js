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

  OpenTypeToCubic(array) {
    return array.map(a => {
      let p = [ a.type ];
      if(a.x1)
        p.push(a.x1);
      if(a.y1)
        p.push(a.y1);
      if(a.x2)
        p.push(a.x2);
      if(a.y2)
        p.push(a.y2);
      if(a.x)
        p.push(a.x);
      if(a.y)
        p.push(a.y);
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