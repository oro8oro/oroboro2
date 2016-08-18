import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Oroboro from '../../api/namespace';
import Items from '../../api/items/items.js';
import ItemFactory from '../../api/items/ItemFactory';
import './OSVGCanvas';
import './OMenu';
import './OEditor.html';

Template.OEditor.onCreated(function() {
  this.layers = [];
  this.groups = [];
  this.items = [];

  this.addItem = (doc) => {
    this.createSVG(doc, this.canvas);
  }

  this.createSVG = (item, container) => {
    let obj;
    if(Oroboro.waitOn[item._id]) {
      obj = Oroboro.waitOn[item._id];
      delete Oroboro.waitOn[item._id];
    }
    else {
      obj = ItemFactory(item).draw(container);
      if(!obj) {
        console.log('element not inserted');
        return;
      }
    }

    obj._svg.on('click', (e) => {
      this.setClipboard(obj._svg.attr('id'));
      this.setSelector(obj);
    });
    this.items.push(obj);
  }

  this.removeSVG = () => {
    if(this.items)
      this.items.forEach(i => {
        i._svg.remove();
      });
  }

  this.clearSelector = (e) => {
    if(this.selector) {
      // Do not delete selector if we click on it
      if(e && $(e.target).attr('role') == this.selector.attr('role'))
        return;
      this.selector.remove();
      delete this.selector;
    }
  }

  this.setSelector = (item) => {
    let elem = item._svg,
      { width, height, x, y } = elem.bbox(),
      // Unit
      u = 20, ud = u/4,
      // Bottom, right 
      d = y + height, r = x + width,
      op = 0.6;

    this.clearSelector();
    this.selector = elem.parent().group()
      .attr('id', 'selector')
      .attr('role', 'selector');
    this.selector.rect(width, height)
      .x(x).y(y)
      .stroke({ color: '#000000', width: 1, dasharray: '5,5', opacity: 0.8 })
      .fill('none');
    this.selector.path([ 
        [ 'M', x + u, d + ud ],
        [ 'L', x, d + ud + u ],
        [ 'L', x + u, d + ud + 2*u ],
        [ 'Z' ]
      ])
      .opacity(op)
      .attr('role', 'selector')
      .on('click', function(e) {
        item.undo();
      });
    this.selector.path([ 
        [ 'M', r - u, d + ud ],
        [ 'L', r, d + ud + u ],
        [ 'L', r - u, d + ud + 2*u ],
        [ 'Z' ]
      ])
      .opacity(op)
      .attr('role', 'selector')
      .on('click', function(e) {
        item.redo();
      });
  }

  this.setClipboard = (text) => {
    this.selectedText = text;
    let textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    this.copySelectionText();
    document.body.removeChild(textArea);
  }

  this.copySelectionText = () => {
    var copysuccess
    try{
        copysuccess = document.execCommand("copy") // run command to copy selected text to clipboard
    } catch(e){
        copysuccess = false
    }
    return copysuccess
  }

  this.setNewPath = () => {
    ItemFactory({ 
      type: 'SimplePath', closed: true
    }, SVG(this.props.container));
  }

  this.setFreeDraw = (ev) => {
    console.log('setFreeDraw');
    const { items } = this;
    console.log(items[items.length-1])
    items[items.length-1].add([ev.pageX, ev.pageY]);
  }

  this.freeOnStart = () => {
    console.log('freeOnStart')
    const { container } = this.props;
    this.setNewPath();
    $('#' + container).on('click', this.setFreeDraw);
  }

  this.freeOnStop = () => {
    console.log('freeOnStop')
    const { container } = this.props;
    $('#' + container).off('click', this.setFreeDraw);
  }

  this.changeType = (e, a) => {
    const { items } = this;
    items[items.length-1].type = $(e.target).val()
  }

  this.autorun(() => {
    let file = FlowRouter.getParam('file');
    if(file)
      this.fileHandle = this.subscribe('Files.file', file);
  });

  this.autorun(() => {
    Items.find({}, {sort: {defs: -1}}).observe({
      added: (doc) => {
        this.addItem(doc);
      }
    });
    Items.find({}).observeChanges({
      changed: (id, fields) => {
        let item = Oroboro.find(id);
        if(item)
          item.refresh(fields);
      }
    });
  });

  Oroboro.elem = this.items;
});

Template.OEditor.onRendered(function() {
  this.editor = SVG('OEditor');
  this.canvas = SVG('OSVGCanvas');
});

Template.OEditor.events({
  'mousedown #OEditor': function(e, inst) {
    inst.clearSelector(e, inst);
  }
});