import Oroboro from '../../namespace';
import Item from './Item';
import SVG from 'svg.js';
import 'svg.draggy.js';
import '../../../utils/connectable.js';

class Actor extends Item {
  setter(doc) {
    let { parameters, pointList } = doc,
      update = 0;

    if(pointList) {
      this._pointList = JSON.parse(pointList);
      update ++;
    }
    if(parameters) {
      if(parameters.bone)
        this.bone = JSON.parse(parameters.bone);
      if(parameters.joint)
        this.joint = JSON.parse(parameters.joint);
      if(parameters.positions)
        this.positions = JSON.parse(parameters.positions);
      if(parameters.head)
        this.head = parameters.head;
      if(parameters.position)
        this.position = JSON.parse(parameters.position);
      update ++;
    }
    return update;
  }

  draw(parent) {
    this._svg = this.getSvg(parent).puppet(this._pointList[0], this._pointList[1], this);
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
    ini: function(x, y, { position, head, bone, joint }) { 
      //this.item = svg.group();
      var self = this 
      this.x = x;
      this.y = y;
      this.position = position;
      this.head = head;
      this.bone = bone;
      this.joint = joint;
      
      this.scale=1;
      this.jointsItem = this.group()
      this.joints = [];
      this.bones = []; 
      this.bonesItem = this.group()
      
      if (this.position !== undefined){
          self.joints.push(this.circle(this.joint[0][1]*this.scale).cx((this.position[0][0]+x)*this.scale).cy((this.position[0][1]+y)*this.scale).attr({ 
              stroke: "#fff",
              "stroke-width": 2
          }).draggy());
          this.joints[0].on("dragmove", function(delta, event){
              self.get()
              //self.set(delta.x,delta.y)
          })
      } else {
          //self.joints[0].cx(x).cy(y);
      }
       
        
      for (var ndx=1;ndx <this.joint.length;ndx++){
          //console.log(h.Class[position][ndx][1]) 
          if (this.position !== undefined){
              this.joints[ndx] = this.circle(this.joint[ndx][1]*this.scale)
                .cx(this.position[ndx][0]*this.scale+x)
                .cy(this.position[ndx][1]*this.scale+y)
                .attr({
              stroke: "#fff",
              "stroke-width": 2*this.scale
              }).draggy(
                  /*
                  function (x, y) {
                  var res = {};
                  var snapRange = 2;
                  res.x = x - (x % snapRange);
                  res.y = y + (y % snapRange);
                  return res;
              } */ 
              ); 
              
          if (ndx == 3 || ndx ==4){
              self.joints[ndx].on("dragend", function(e){
              //console.log(e)
              self.modHead(self) // self this
                  
          })
          }    
              
              
          
          } else {
              self.joints[ndx].cx(self.joints[ndx].cx()+x).cy(this.joints[ndx].cy()+y)
              //console.log(self.joints[ndx].cy()+y)
          }

      } 
      
      if (this.position !== undefined){
      this.setBones()
      if(this.head) {
          this.headItem = this.image(this.head, 100, 100) //.cx(this.joints[4].cx()).cy(this.joints[4].cy()+10)
          
          this.modHead()
          this.headItem.on("mouseover",function(e){
              //alert(this);
              this.back()
          })
          this.headItem.on("mouseout",function(e){
              //alert(this);
              this.front()
          })
      }
      }
      return this;
    },
    modHead: function(self1){ 
      let neckJ, headJ;
      this.joint.forEach((j, i) => {
        if(j[0] == 'Neck')
          neckJ = i;
        if(j[0] == 'Head')
          headJ = i;
      });
      var x = this.joints[headJ].cx()-this.joints[neckJ].cx();
      var y = this.joints[headJ].cy()-this.joints[neckJ].cy();
      var w = Math.sqrt(y*y + x*x);
      //console.log(w);
      var ang = y/x;
      var s = 1;
      if (y<0) s=-1;
      //console.log(ang);
      //self1.headItem.attr({width:2*w,height:2*w}).cx(self1.joints[4].cx()).cy(self1.joints[4].cy()+10); 
      //self1.headItem.transform({rotation:(-Math.atan((1/ang+0.00))*180/Math.PI)})  // (ang)*180/Math.PI+270  // -90*s
      this.headItem.attr({width:2*w,height:2*w}).cx(this.joints[headJ].cx()).cy(this.joints[headJ].cy()+10); 
      this.headItem.transform({rotation:(-Math.atan((1/ang+0.00))*180/Math.PI)})  // (ang)*180/Math.PI+270  // -90*s
      //self1.say();
        
    },
    setBones: function(){
      for (var ndx in this.bone){
          //console.log(this.joints[h.Class.bone[ndx][1]].connectable()) 
           
          var conn = this.joints[this.bone[ndx][0]+1].connectable({
              container: this.bonesItem,
              width: this.bone[ndx][2]*this.scale
          }, this.joints[this.bone[ndx][1]+1]
          );
      }
    },
    mirror: function(){
      var x= this.joints[0].cx();
      var y= this.joints[0].cy(), temp;
      for (var ndx=1;ndx <this.joint.length;ndx++){
          
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
      var gr = this.jointsItem.group();
      var dialog = gr.tgraph(0,0);
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
      var gr = this.jointsItem.group();
      var dialog = gr.tgraph(0,0);
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
    
    puppet: function(x,y,obj) {
        //this.put(new SVG.Puppet)
        //console.log("om") 
        // new SVG.Puppet
        //this.ini(x,y,stance)
      return this.put(new SVG.Puppet).ini(x,y,obj);
    } 

  }
});
export default Actor;
Oroboro.classes.Actor = Actor;