import { Chronology } from 'chronology.js';

class Common {
  constructor() {
    this._chain = []; //[[funcname, [params]], ]
    this._chronology = new Chronology();
    this._listeners = {}
  }

  getSvg(el) {
    if(typeof el == 'string')
      return SVG.get(el) || SVG(el);
    return el;
  }

  trimDec(no, dec=3) {
    return parseFloat(no.toFixed(dec));
  }

  chronology(up, down) {
    this._chronology.add({ up, down });
  }

  undo() {
    this._chronology.undo();
  }

  redo() {
    this._chronology.redo();
  }

   addListener(type, func) {
    if(!this._listeners[type])
      return;
    this._listeners[type].push(func);
  }

  callListeners(type, event, svg, inst) {
    this._listeners[type].forEach(f => {
      f(event, svg, inst);
    });
  }
}


export default Common;