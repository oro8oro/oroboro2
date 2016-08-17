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
  constructor(doc) {
    super(doc);
    this._textId = doc.text;
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

  draw(parent, multi) {
    this._group = parent.group();
    super.draw(this._group, multi);
    this.setText();
  }

  simple() {
    if(this.testGroup)
      this.testGroup.remove();
    this.testGroup = SVG('OSVGCanvas').group();
    //this.setBoxCorners().simpleBox();
    this.setBoxCorners()
      .roundedBox()
      .simpleConnector();

    return this._pathArray;
  }

  setBoxCorners() {
    let center = this._pointList[1],
      p1 = this._pointList[2],
      d = distance(center, p1),
      p2 = pointByAngleDistance(center, flipAngle(getAngle(center, p1), 'h'), d),
      p3 = pointByAngleDistance(center, getAngle(p1, center), d),
      p4 = pointByAngleDistance(center, getAngle(p2, center), d);
      let { _id, _pointList } = this;
      let self = this;
      this.testGroup.circle(10).cx(this._pointList[0][0]).cy(this._pointList[0][1])
        .opacity(0.8).fill('#FF0600')
        .draggy()
        .on('dragmove', function(e) {
          let { pageX, pageY } = e.detail.event;
          _pointList[0] = [ pageX, pageY ];
          self.update({ db: false });
        })
        .on('dragend', function(e) {
          let { pageX, pageY } = e.detail.event;
          _pointList[0] = [ pageX, pageY ];
          self.update();
        });
      let start, ini, temp;
      this.testGroup.circle(10).cx(center[0]).cy(center[1])
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
          self.update({ db: false });
          self._text.dmoveR(pageX - temp[0], pageY - temp[1]);
          temp = [ pageX, pageY ];
        })
        .on('dragend', function(e) {
          let { pageX, pageY } = e.detail.event;
          _pointList[1] = [ pageX, pageY ];
          _pointList[2] = [ ini[0] + pageX-start[0], ini[1] + pageY-start[1] ];
          self.update();
        });
      this.testGroup.circle(10).cx(p1[0]).cy(p1[1])
        .opacity(0.8).fill('#FF0600')
        .draggy()
        .on('dragmove', function(e) {
          let { pageX, pageY } = e.detail.event;
          _pointList[2] = [ pageX, pageY ];
          self.update({ db: false });
        })
        .on('dragend', function(e) {
          let { pageX, pageY } = e.detail.event;
          _pointList[2] = [ pageX, pageY ];
          self.update();
          self.positionText();
        });
      
    this._boxCorners = [ p1, p2, p3, p4 ];
    return this;
  }

  simpleBox() {
    let [ p1, p2, p3, p4 ] = this._boxCorners;
    return [
      [ 'M', p1[0], p1[1] ],
      [ 'L', p2[0], p2[1] ],
      [ 'L', p3[0], p3[1] ],
      [ 'L', p4[0], p4[1] ],
      [ 'Z' ]
    ];
  }

  roundedBox() {
    // [ [x, y], ...] - 4 points
    let points = this._boxCorners,
      textBox = [];
    if(points.length < 2)
        return [ 'M', 0, 0 ];
    let pp = points,
      center = this._pointList[1],
      radius = this._radius = distance(center, pp[0]) / 10,
      fS = 1,
      rx = radius, ry = radius,
      path = [ 'M', pp[0][0], pp[0][1] ],
      c, dx, dy, a, bis, p1, p2, pp1, pp2, at1, at2, ph, pq1, pq2,
      a1, a2, cw = 0, ccw = 0;

    for(let i=0; i<pp.length; i++) {
        if(i==0)
            pp1 = pp[pp.length-1]
        else
            pp1 = pp[i-1]
        if(i == pp.length-1)
            pp2 = pp[0]
        else
            pp2 = pp[i+1]

        a1 = getAngle(pp[i], pp1)
        a2 = getAngle(pp[i], pp2)
        a = angleDiff(a1, a2)
        dx = rx / Math.sin(a/2)
        dy = ry / Math.sin(a/2)
        if(a == angleDiffCW(a1, a2)) {
            bis = turnCW(a1, a/2)
            fS = 1
            cw++
        }
        else {
            bis = turnCCW(a1, a/2)
            fS = 0
            ccw++
        }
        c = pointByAngleDistance(pp[i], bis, dx)
        p1 = pointByAngleDistance(pp[i], a1, Math.cos(a/2)*dx)
        p2 = pointByAngleDistance(pp[i], a2, Math.cos(a/2)*dy)
        at1 = pointByAngleDistance(pp[i], a1, distance(pp[i], p1)/2)
        at2 = pointByAngleDistance(pp[i], a2, distance(pp[i], p2)/2)

        if(i==0)
            path = [ ['M', p1[0], p1[1]] ]

        // We want to add some additional points (1/2 and 1/4 on each side)
        // after the rounded corner
        // Same x coord (vertical side)
        if(pp[i][0] == p2[0]) {
          // 1/2 point
          ph = [ p2[0], center[1] ];
          // 1/6 points
          pq1 = [ p2[0], p2[1] - (p2[1] - center[1])/3 ];
          pq11 = [ p2[0], p2[1] - 2*(p2[1] - center[1])/3 ];
          pq2 = [ p2[0], center[1] - (p2[1] - center[1])/3 ];
          pq22 = [ p2[0], center[1] - 2*(p2[1] - center[1])/3 ];
        }
        // Same y coord (horizontal side)
        else {
          ph = [ center[0], p2[1] ];
          pq1 = [ p2[0] - (p2[0] - center[0])/3, p2[1] ];
          pq11 = [ p2[0] - 2*(p2[0] - center[0])/3, p2[1] ];
          pq2 = [ center[0] - (p2[0] - center[0])/3, p2[1] ];
          pq22 = [ center[0] - 2*(p2[0] - center[0])/3, p2[1] ];
        }

        path = path.concat([
            // The actual rounded corner
            [ 'L', p1[0], p1[1] ],
            [ 'C', at1[0], at1[1], at2[0], at2[1], p2[0], p2[1] ],
            // Some additional points
            [ 'L', pq1[0], pq1[1] ],
            [ 'L', pq11[0], pq11[1] ],
            [ 'L', ph[0], ph[1] ],
            [ 'L', pq2[0], pq2[1] ],
            [ 'L', pq22[0], pq22[1] ],
        ])

        this.testGroup.circle(7).cx(p1[0]).cy(p1[1]).opacity(0.8).fill('#272822');
        this.testGroup.circle(7).cx(p2[0]).cy(p2[1]).opacity(0.8).fill('#272822');
        this.testGroup.circle(7).cx(pq1[0]).cy(pq1[1]).opacity(0.8).fill('#64645C');
        this.testGroup.circle(7).cx(pq11[0]).cy(pq11[1]).opacity(0.8).fill('#64645C');
        this.testGroup.circle(7).cx(ph[0]).cy(ph[1]).opacity(0.8).fill('#00B5AD');
        this.testGroup.circle(7).cx(pq2[0]).cy(pq2[1]).opacity(0.8).fill('#64645C');
        this.testGroup.circle(7).cx(pq22[0]).cy(pq22[1]).opacity(0.8).fill('#64645C');
    }

    let l = path[path.length-1].length;
    path.push([ 'L', path[path.length-1][l-2], path[path.length-1][l-1] ]);
    path.push([ 'Z' ]);
    this._pathArray = path;
    return this;
  }

  setText() {
    this._text = new CubicOpenType(Items.findOne(this._textId));
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
      this._group
    );
    return this;
  }

  simpleConnector() {
    let tip = this._pointList[0],
      box = this._pathArray,
      pos, corner, distMin = Infinity, dist;
      //console.log('tip: ', tip)
      //console.log(JSON.stringify(box))
    box.forEach((p, i) => {
      if(p[0] != 'C')
        return;

      let posT, cornerT;
      //console.log('point: ', JSON.stringify(p))
      //console.log('middle: ', JSON.stringify(box[i+3]))
      //console.log('i+6: ', JSON.stringify(box[i+6]))
      //console.log('dist: ', dist)
      // Same x coord (vertical side)
      if(p[5] == box[i+3][1]) {
        dist = Math.abs(tip[0]-p[5]);
        //console.log('vertical dist: ', dist)
        // We already have a better position
        if(dist <= distMin) {
          // We check if the tip is inside the area between the C and the half point
          if(isBetween(tip[1], p[6], box[i+3][2])) {
            posT = i+2;
            distMin = dist;
            //console.log('vertical 1st half')
          }
          // Then check the area between the half point and the next C
          if(isBetween(tip[1], box[i+3][2], box[i+6][2] || box[0][2])) {
            posT = i+5;
            distMin = dist;
            //console.log('vertical 2nd half')
          }
        }
      }
      // Same y coord (horizontal side) (same process)
      else {
        dist = Math.abs(tip[1]-p[6]);
        //console.log('horizontal dist: ', dist)
        // We already have a better position
        if(dist <= distMin) {

          if(isBetween(tip[0], box[i-1][1], box[i+3][1])) {
            posT = i+2;
            distMin = dist;
            //console.log('horizontal 1st half')
          }
          let last = box[i+7] ? box[i+7][5] : box[1][5];
          if(isBetween(tip[0], box[i+3][1], last)) {
            posT = i+5;
            distMin = dist;
            //console.log('horizontal 2nd half')
          }
        }
      }
      //console.log('posT: ', posT);
      if(!posT) {
        dist = distance(tip, [ p[5], p[6] ]);
        //console.log('corner dist: ', dist)
        if(dist > distMin)
          return;

        posT = i;
        cornerT = [ p[5], p[6] ];
        distMin = dist;
        //console.log('corner')
      }
      if(posT) {
        pos = posT;
        if(cornerT)
          corner = cornerT;
        else
          corner = null;
      }
      //console.log('pos: ', pos)
      //console.log('corner: ', corner)
      //console.log('distMin: ', distMin)
      this.testGroup.circle(10).cx(box[i+3][1]).cy(box[i+3][2])
        .opacity(0.8).fill('#0080AB')
      
    });

    // We connect the tip at the calculated position.
    if(pos)
      if(!corner)
        box.splice(pos, 0, [ 'L', tip[0], tip[1] ]);
      else {
        // We remove the rounded corner and connect the tip there
        box.splice(pos, 1, [ 'L', tip[0], tip[1] ], [ 'L', corner[0], corner[1] ] );
      }

    this._pathArray = box;
    return this;
  }

};

export default SimpleDialog;
Oroboro.classes.SimpleDialog = SimpleDialog;

/*
Items.methods.insert.call({
  pointList: '[[400,600],[600,400],[650,450]]',
  type: 'SimpleDialog'
});
*/