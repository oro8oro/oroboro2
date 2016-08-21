import Oroboro from '../../namespace';
import Items from '../items';
import SimplePath from './SimplePath';
import SVG from 'svg.js';
import 'svg.draggy.js';
import '../../../utils/connectable.js';

// SimpleActor & XBox Actor
class Actor extends SimplePath {
  constructor(doc, parent, file) {
    super(doc, parent, file);
  }

  setter(doc) {
    let update = super.setter(doc);
    let { parameters } = doc;

    if(parameters) {
      if(parameters.bone)
        this._bone = JSON.parse(parameters.bone);
      if(parameters.joint)
        this._joint = JSON.parse(parameters.joint);
      if(parameters.positions)
        this._positions = JSON.parse(parameters.positions);
      if(parameters.head)
        this._head = parameters.head;
      update ++;
    }
    return update;
  }

  draw() {
    let { 
      _pointList, _bone, _joint, _head, 
      onDragStart, onDragMove, onDragEnd,
    } = this;

    this._svg = this._parent.puppet({
      points: _pointList[0],
      bone: _bone,
      joint: _joint,
      head: _head,
    }, {
      //onDragStart,
      //onDragMove,
      onDragEnd: (e, delta, type, points) => { this.onDragEnd(e, delta, type, points); }
    });
    this._svg.hideJoints();
    this.setListeners();
    return this;
  }

  setListeners() {
    super.setListeners();
    this.listen('click', (e) => {
      this._svg.showJoints();
    });
    this.listen('unclick', () => {
      console.log('actor unclick')
      this._svg.hideJoints();
    });
  }

  simple() {
    return '[]';
  }

  // Temporarily, we have to make the _svg a path
  update({ db=false, modifier={} }={}) {
    this._cache = this._svg.node.outerHTML;
    if(db) {
      Items.methods.update.call({ id: this._id, modifier: {
        pointList: JSON.stringify(this._pointList)
      }});
    }
  }

  onDragEnd(e, delta, type, points) {
    if(!type)
      return;
    this._pointList = [points];
    this.update({ db: true });
    return this;
  }

  head(url) {
    if(!url)
      return this._head;
    this._head = url;
    this._svg.setHead(this._head);
    Items.methods.update.call({ id: this._id, modifier: {
      'parameters.head': url
    }});
    return this;
  }
}


// (c) Christian Tzurcanu - SVG Puppet
SVG.Puppet = SVG.invent({
  // Define the type of element that should be created
  create: 'g',

  // Specify from which existing class this shape inherits
  inherit: SVG.Container ,

  // Add custom methods to invented shape
  extend: {
    // Create method to proportionally scale the rounded corners
    ini: function({ 
      points, head, bone, joint 
    }, {
      onDragStart, onDragMove, onDragEnd
    }) { 
      //this.item = svg.group();
      let self = this 
      this.points = points;
      this.head = head;
      this.bone = bone;
      this.joint = joint;
      this.onDragStart = onDragStart || (() => {});
      this.onDragMove = onDragMove || (() => {});
      this.onDragEnd = onDragEnd || (() => {});

      this.scale=1;
      this.jointsItem = this.group()
      this.joints = [];
      this.bones = []; 
      this.bonesItem = this.group()
      
      if (this.points !== undefined){
        self.joints.push(this.circle(this.joint[0][1]*this.scale*2).cx(this.points[0][0]*this.scale).cy(this.points[0][1]*this.scale).attr({ 
            stroke: "#fff",
            "stroke-width": 2
        }).draggy());
        let start, ini;
        self.Actor = this.joints[0]
          .on("dragstart", function(e){
            let { pageX, pageY } = e.detail.event;
            start = [ pageX, pageY ];
            ini = [ pageX, pageY ];
            self.onDragStart(e.detail.event, 'Actor');
          })
          .on("dragmove", function(e){
            let { pageX, pageY } = e.detail.event;
            self.move(pageX - ini[0], pageY - ini[1]);
            self.onDragMove(e.detail.event, {
              movedX: pageX - start[0],
              movedY: pageY - start[1],
              deltaX: pageX - ini[0],
              deltaY: pageY - ini[1],
            }, 'Actor');
            ini = [ pageX, pageY ];
          })
          .on("dragend", function(e){
            let { pageX, pageY } = e.detail.event;
            self.move(pageX - ini[0], pageY - ini[1]).sync();
            self.onDragEnd(e.detail.event, {
              movedX: pageX - start[0],
              movedY: pageY - start[1],
              deltaX: pageX - ini[0],
              deltaY: pageY - ini[1],
            }, 'Actor', self.points);
          });
      } else {
          //self.joints[0].cx(x).cy(y);
      }
       
        
      for (let ndx=0;ndx <this.joint.length;ndx++){
        if (this.points !== undefined){
            this.joints[ndx] = this.circle(this.joint[ndx][1]*this.scale)
              .cx(this.points[ndx][0]*this.scale)
              .cy(this.points[ndx][1]*this.scale)
              .attr({
                stroke: "#fff",
                "stroke-width": 2*this.scale
                })
              .draggy(
                /*
                function (x, y) {
                let res = {};
                let snapRange = 2;
                res.x = x - (x % snapRange);
                res.y = y + (y % snapRange);
                return res;
              }*/)
              .on("dragstart", function(e){
                self.onDragStart(e.detail.event, self.joint[ndx][0]);
              })
              .on("dragmove", function(e){
                let { pageX, pageY } = e.detail.event;
                self.onDragMove(e.detail.event, self.joint[ndx][0]);
                if(self.joint[ndx][0] == 'Base')
                  self.Actor.cx(this.cx()).cy(this.cy());
              })
              .on("dragend", function(e){
                if(self.joint[ndx][0] == 'Head' || self.joint[ndx][0] == 'Neck')
                  self.modHead();
                let x = this.cx(), y = this.cy();
                self.sync(ndx, x, y)
                  .onDragEnd(e.detail.event, {
                    x,
                    y,
                  }, self.joint[ndx][0], self.points);
              });
            
        } else {
            self.joints[ndx].cx(self.joints[ndx].cx()).cy(this.joints[ndx].cy())
        }

      } 
      
      if (this.points !== undefined){
      this.setBones()
      if(this.head) {
          this.setHead()
      }
      }
      return this;
    },
    move: function(dx, dy) {
      // Move all joints
      this.joints.forEach(j => {
        j.dmove(dx, dy);
      });
      // Update bones (connections)
      this.bones.forEach(b => {
        b.update();
      })
      // Update head
      if(this.head)
        this.modHead();
      return this;
    },
    sync: function(ndx, x, y) {
      if(ndx)
        this.points[ndx] = [x, y];
      else
        this.points = this.joints.map(j => {
          return [j.cx(), j.cy()];
        });
      return this;
    },
    jointInd(name) {
      let index;
      this.joint.some((j,i) => {
        if(j[0] == name) {
          index = i;
          return true;
        }
        return false;
      });
    },
    showJoints() {
      this.joints.forEach(j => {
        j.opacity(1);
      });
      this.Actor.opacity(1);
    },
    hideJoints() {
      this.joints.forEach(j => {
        j.opacity(0);
      });
      this.Actor.opacity(0);
    },
    setHead: function(url) {
      this.head = url || this.head;
      if(this.headItem)
        this.headItem.remove();
      this.headItem = this.image(this.head, 100, 100);
      this.modHead();
      this.headItem
        .on("mouseover",function(e){
            this.back()
        })
        .on("mouseout",function(e){
          this.front()
        });
    },
    modHead: function(self1){ 
      let neckJ, headJ;
      this.joint.forEach((j, i) => {
        if(j[0] == 'Neck')
          neckJ = i;
        if(j[0] == 'Head')
          headJ = i;
      });
      let x = this.joints[headJ].cx()-this.joints[neckJ].cx();
      let y = this.joints[headJ].cy()-this.joints[neckJ].cy();
      let w = Math.sqrt(y*y + x*x);
      //console.log(w);
      let ang = y/x;
      let s = 1;
      if (y<0) s=-1;
      //console.log(ang);
      //self1.headItem.attr({width:2*w,height:2*w}).cx(self1.joints[4].cx()).cy(self1.joints[4].cy()+10); 
      //self1.headItem.transform({rotation:(-Math.atan((1/ang+0.00))*180/Math.PI)})  // (ang)*180/Math.PI+270  // -90*s
      this.headItem.attr({width:2*w,height:2*w}).cx(this.joints[headJ].cx()).cy(this.joints[headJ].cy()+10); 
      this.headItem.transform({rotation:(-Math.atan((1/ang+0.00))*180/Math.PI)})  // (ang)*180/Math.PI+270  // -90*s
      //self1.say();
      return this;
    },
    setBones: function(){
      for (let ndx in this.bone){
        //console.log(this.joints[h.Class.bone[ndx][1]].connectable()) 
         
        this.bones.push(
          this.joints[this.bone[ndx][0]+1].connectable({
            container: this.bonesItem,
            width: this.bone[ndx][2]*this.scale
          }, this.joints[this.bone[ndx][1]+1]
        ));
      }
      return this;
    },
    mirror: function(){
      let x= this.joints[0].cx();
      let y= this.joints[0].cy(), temp;
      for (let ndx=1;ndx <this.joint.length;ndx++){
          
          this.joints[ndx].cx(-this.joints[ndx].cx()+2*x).cy(this.joints[ndx].cy())
      }
      this.bonesItem.clear()
      this.setBones();
      return this;
    },
    say: function(text){
      if (text !== undefined) {
          this.say=text;
      } else {
          text = this.say;
      }
      //this.item.add( new SVG.TGraph)
      let gr = this.jointsItem.group();
      let dialog = gr.tgraph(0,0);
      dialog.t("M"+(this.joints[4].cx()+50)+","+(this.joints[4].cy())+"<30F120>120F50A<90,20F130A<90,20F300A<90,20F130A<90,20F150Z");
      dialog.opacity=0.5; 
      dialog.render(false);
      dialog.attr({opacity:0.5,fill:"#ddd"})
      gr.text(text).font({size:38}).cx(this.x+200).cy(this.y-270)
      return this;
    },
    think: function(text){
      if (text !== undefined) {
          this.think=text;
      } else {
          text = this.think;
      }
      let gr = this.jointsItem.group();
      let dialog = gr.tgraph(0,0);
      dialog.t("M"+(this.x+45)+","+(this.y-107)+">90A<180,7F15A<180,7F20ZM"+(this.x+70)+","+(this.y-120)+"A<180,15F50A<180,15F50ZM"+(this.x+50)+","+(this.y-150)+"A<180,75F250A<180,75Z");
      dialog.opacity=0.5
      dialog.render(false);
      dialog.attr({opacity:0.5,fill:"#ddd"})
      gr.text(text).font({size:38}).cx(this.x+180).cy(this.y-220)
    }
  },

  // Add method to parent elements
  construct: {
    // Create a rounded element
    
    puppet: function(obj,callb) {
        //this.put(new SVG.Puppet)
        //console.log("om") 
        // new SVG.Puppet
        //this.ini(x,y,stance)
      return this.put(new SVG.Puppet).ini(obj,callb);
    } 

  }
});

XboxHuman = {
        standing: [[0,0],[0,150],[0,63],[0,-30],[0,-85],[-63,7],[-85,93],[-80,176],[-78,203],[65,8],[95,93],[82,174],[82,200],[-30,150],[-25,309],[-15,461],[-33,479],[30,150],[27,309],[22,459],[44,476],[0,0],[-74,229],[-104,205],[81,226],[105,199]],
        show: [[0,0],[0,150],[0,63],[0,-30],[0,-85],[-63,7],[-136,21],[-223,-15],[-242,-26],[65,8],[95,93],[82,174],[82,200],[-30,150],[-25,309],[-15,461],[-33,479],[30,150],[27,309],[22,459],[44,476],[0,0],[-261,-37],[-226,-45],[81,226],[105,199]],
        joint: [
            ["Base", 40],
            ["SpineBase", 24],
            ["SpineMid", 16],
            ["Neck", 16],
            ["Head", 20],
            ["ShoulderLeft", 16],
            ["ElbowLeft", 16],
            ["WristLeft", 16],
            ["HandLeft", 16],
            ["ShoulderRight", 16],
            ["ElbowRight", 16],
            ["WristRight", 16],
            ["HandRight", 16],
            ["HipLeft", 16],
            ["KneeLeft", 16],
            ["AnkleLeft", 16],
            ["FootLeft", 16],
            ["HipRight", 16],
            ["KneeRight", 16],
            ["AnkleRight", 16],
            ["FootRight", 16],
            ["SpineShoulder", 20],
            ["HandTipLeft", 10],
            ["ThumbLeft", 16],
            ["HandTipRight", 10],
            ["ThumbRight", 16]
        ],
        bone: [
            [0,1,50],
            [1,20,70],
            [20,2,10],
            [2,3,.4],
            [0,12,40],
            [0,16,40],
            [12,13,30],
            [13,14,25],
            [14,15,25],
            [16,17,30],
            [17,18,25],
            [18,19,25],
            [20,4,45],
            [4,5,25],
            [5,6,20],
            [6,7,20],
            [7,21,10],
            [6,22,5],
            [20,8,45],
            [8,9,25],
            [9,10,20],
            [10,11,20],
            [11,23,10],
            [10,24,5] 
        ]
}

SimpleHuman = {
    positions: {
        standing: [
            [[200,200],[200,350],[200,170],[200,115],[115,293],[122,403],[295,293],[282,400],[175,509],[175,679],[227,509],[227,676]]
        ],
    },
    joint: [
        ["Base", 24],
        ["SpineBase", 34],
        ["Neck", 16],
        ["Head", 40],

        ["ElbowLeft", 16],
        ["HandLeft", 16],
        ["ElbowRight", 16],
        ["HandRight", 16],

        ["KneeLeft", 16],
        ["FootLeft", 16],
        ["KneeRight", 16],
        ["FootRight", 16]
    ],
    bone: [
        [-1,0,50],
        [-1,1,.4],
        [1,2,10],

        [-1,3,20],
        [3,4,5],
        [-1,5,20],
        [5,6,5],

        [0,7,10],
        [7,8,10],
        [0,9,10],
        [9,10,10]
    ]
}

export default Actor;
Oroboro.classes.Actor = Actor;
Oroboro.api.addActor = (file, group) => {
  let inst = Oroboro.files.get(file);
  if(!group)
    group = inst._selected.get('group');
  if(group)
    group = group._id;
  let obj = Items.methods.addActor.call({ group, file });
  return Oroboro.files.get(file).waitOn(obj, Actor);
}