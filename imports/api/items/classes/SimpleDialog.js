import Oroboro from '../../namespace';
import Items from '../items';
import Item from './Item';
import SimplePath from './SimplePath';
import CubicOpenType from './CubicOpenType';

import { 
  distance, 
  isBetween,
  getAngle, 
  flipAngle, 
  pointByAngleDistance, 
  turnCW, 
  turnCCW } from '../../../utils/svgUtils';


class SimpleDialog extends SimplePath {
  constructor(doc, parent, file) {
    super(doc, parent, file);
    this._textId = doc.text;
  }

  remove(obj) {
    super.remove(obj);
    this._text.remove(obj);
    this._tempGroup.clear();
  }

  setListeners() {
    super.setListeners();
    this.listen('click', (e) => {
      this._tempGroup.opacity(1);
    });
    this.listen('unclick', () => {
      this._tempGroup.opacity(0);
    });
  }

  pointListToArray(str) {
    return JSON.parse(str).map(p => [ parseFloat(p[0]), parseFloat(p[1]) ]);
  }

  talk() {

  }

  think() {

  }

  shout() {

  }

  draw() {
    //this._group = this._parent.group();
    super.draw();
    this.setText();
    return this;
  }

  simple() {
    if(!this._tempGroup)
      this._tempGroup = this._file._tempSvg.group();
    this._tempGroup.clear().opacity(0);
    this.drawBubble().setControls();

    return this._pathArray;
  }

  drawBubble() {
    var corner_rate = 0.25
    var cen = this._pointList[1]
    var src = this._pointList[0]
    var corn = this._pointList[2]
    var loc = "", index
    var box = []
    var patharray=[]
    var choices = [3,4,8,9,13,14,18,19]
    
    var max = [Math.abs(cen[0]-corn[0]),Math.abs(cen[1]-corn[1])]
    var corner_diff= Math.min(max[0], max[1])*corner_rate

    this._boxCorners = [ 
      [ cen[0]-max[0], cen[1]-max[1] ],
      [ cen[0]+max[0], cen[1]-max[1] ],
      [ cen[0]+max[0], cen[1]+max[1] ],
      [ cen[0]-max[0], cen[1]+max[1] ]
    ];
    
    patharray=[
        ["M", cen[0]-max[0], cen[1]-max[1]+corner_diff],
        ["C", cen[0]-max[0], cen[1]-max[1], cen[0]-max[0], cen[1]-max[1], cen[0]-max[0]+corner_diff, cen[1]-max[1]],
        ["L", cen[0]-max[0]+2*corner_diff, cen[1]-max[1]],
        ["L", cen[0], cen[1]-max[1]],  // 3
        ["L", cen[0]+max[0]-2*corner_diff, cen[1]-max[1]],  // 4
        ["L", cen[0]+max[0]-2*corner_diff, cen[1]-max[1]],
        ["C", cen[0]+max[0], cen[1]-max[1], cen[0]+max[0], cen[1]-max[1], cen[0]+max[0], cen[1]-max[1]+corner_diff],
        ["L", cen[0]+max[0], cen[1]-max[1]+2*corner_diff],
        ["L", cen[0]+max[0], cen[1]],  // 8
        ["L", cen[0]+max[0], cen[1]+max[1]-2*corner_diff],  // 9
        ["L", cen[0]+max[0], cen[1]+max[1]-corner_diff],
        ["C", cen[0]+max[0], cen[1]+max[1], cen[0]+max[0], cen[1]+max[1], cen[0]+max[0]-corner_diff, cen[1]+max[1]],
        ["L", cen[0]+max[0]-2*corner_diff, cen[1]+max[1]],
        ["L", cen[0], cen[1]+max[1]],  // 13
        ["L", cen[0]-max[0]+2*corner_diff, cen[1]+max[1]],  // 14
        ["L", cen[0]-max[0]+corner_diff, cen[1]+max[1]],
        
        ["C", cen[0]-max[0], cen[1]+max[1], cen[0]-max[0], cen[1]+max[1], cen[0]-max[0], cen[1]+max[1]-corner_diff],
        ["L", cen[0]-max[0], cen[1]+max[1]-2*corner_diff],
        ["L", cen[0]-max[0], cen[1]],  // 18
        ["L", cen[0]-max[0], cen[1]-max[1]+2*corner_diff],  // 19
        ["Z"]
    ]
    
    if (src[0]-cen[0] < 0) {
        loc = "0"
    } else {
        loc = "1"
    }
    
    if (src[1]-cen[1] < 0) {
        loc += "0"
    } else {
        loc += "1"
    }
    
    //console.log(loc)
    switch (loc) {
        case "00":
            loc += "0"
            //(Bx - Ax) * (Cy - Ay) - (By - Ay) * (Cx - Ax)
            cen[0]+max[0], cen[1]+max[1]
            if ( max[0]*(src[1]-cen[1]) - max[1]*(src[0]-cen[0])< 0) {
                //console.log("exact 3")
                index = 3
                
            } else {
                //console.log("exact 19")
                index = 19
            }
            break;
        case "01":
            loc += "1"
            if ( -max[0]*(src[1]-cen[1]) - max[1]*(src[0]-cen[0])< 0) {
                //console.log("exact 14")
                index = 14
            } else {
                //console.log("exact 18")
                index = 18
            }
            
            break;
        case "10":
            loc += "2"
            if ( -max[0]*(src[1]-cen[1]) - max[1]*(src[0]-cen[0])< 0) {
                //console.log("exact 8")
                index = 8
            } else {
                //console.log("exact 4")
                index = 4
            }
            
            break;
        case "11":
            loc += "3"
            if ( max[0]*(src[1]-cen[1]) - max[1]*(src[0]-cen[0])< 0) {
                //console.log("exact 9")
                index = 9
            } else {
                //console.log("exact 13")
                index = 13
            }
            break;
        default:
         console.log("q")
            
    }
    patharray.splice(index,0,["L",src[0],src[1]])
    //console.log(loc)
    this._pathArray = patharray;
    return this;
  }

  setControls() {
    let { _pointList } = this;
    let center = this._pointList[1],
      src = this._pointList[0],
      corner = this._pointList[2],
      self = this,
      d = 20;
    this._tempGroup.circle(d).cx(src[0]).cy(src[1])
      .opacity(0.8).fill('#FF0600')
      .draggy()
      .on('dragmove', function(e) {
        let { pageX, pageY } = e.detail.event;
        _pointList[0] = [ pageX, pageY ];
        self.update();
      })
      .on('dragend', function(e) {
        let { pageX, pageY } = e.detail.event;
        _pointList[0] = [ pageX, pageY ];
        self.update({ db:true });
      });
    let start, ini, temp;
    this._tempGroup.circle(d).cx(center[0]).cy(center[1])
      .opacity(0.8).fill('#FF0600')
      .draggy()
      .on('dragstart', function(e) {
        let { pageX, pageY } = e.detail.event;
        start = [ pageX, pageY ];
        temp = [ pageX, pageY ];
        ini = JSON.parse(JSON.stringify(_pointList[2]));
      })
      .on('dragmove', function(e) {
        let { pageX, pageY } = e.detail.event;
        _pointList[1] = [ pageX, pageY ];
        _pointList[2] = [ ini[0] + pageX-start[0], ini[1] + pageY-start[1] ];
        self.update();
        self._text.dmoveR(pageX - temp[0], pageY - temp[1]);
        temp = [ pageX, pageY ];
      })
      .on('dragend', function(e) {
        let { pageX, pageY } = e.detail.event;
        _pointList[1] = [ pageX, pageY ];
        _pointList[2] = [ ini[0] + pageX-start[0], ini[1] + pageY-start[1] ];
        self.update({ db:true });
      });
    this._tempGroup.circle(d).cx(corner[0]).cy(corner[1])
      .opacity(0.8).fill('#FF0600')
      .draggy()
      .on('dragmove', function(e) {
        let { pageX, pageY } = e.detail.event;
        _pointList[2] = [ pageX, pageY ];
        self.update();
      })
      .on('dragend', function(e) {
        let { pageX, pageY } = e.detail.event;
        _pointList[2] = [ pageX, pageY ];
        self.update({ db:true });
        self.positionText();
      });
    return this;
  }

  setText() {
    this._text = this._file._defs._items.get(this._textId);
    // Avoid showing ugly text in the beginning, before wrap
    this._svgText = this._svg.parent().use(this._text._svg).opacity(0);
    this.positionText();
    return this;
  }

  positionText() {
    let width = distance(this._boxCorners[0], this._boxCorners[1]),
      height = distance(this._boxCorners[1], this._boxCorners[2]),
      delta = width / 20,
      x = Math.min(...this._boxCorners.map(p => p[0])) + delta,
      y = Math.min(...this._boxCorners.map(p => p[1])) + delta;

    this._text._pointList = [x,y];
    this._text.wrap(
      width - 2*delta, 
      height - 2*delta,
      // Show text now
      () => { this._svgText.front().opacity(1); }
    );
    return this;
  }

  text(text) {
    if(!text)
      return this._text._text;
    this._text.text(text);
    return this;
  }

};

export default SimpleDialog;
Oroboro.classes.SimpleDialog = SimpleDialog;
Oroboro.api.addDialog = (file, group) => {
  file = file || (Oroboro.inEdit ? Oroboro.inEdit._id : null);
  console.log(file)
  if(!file)
    return;
  let inst = Oroboro.files.get(file);
  console.log(inst)
  console.log(inst._selected.get('layer'))
  console.log(inst._selected.get('group'))
  group = group || 
    (inst._selected.has('group') ? inst._selected.get('group')._id : null) || 
    (inst._selected.has('layer') ? inst._selected.get('layer')._id : null)
  console.log(group)
  if(!group)
    return;
  let obj = Items.methods.addDialog.call({ group, file });
  //return Oroboro.files.get(file).waitOn(obj, SimpleDialog);
}

/*
Items.methods.insert.call({
  pointList: '[[400,600],[600,400],[650,450]]',
  type: 'SimpleDialog'
});
*/