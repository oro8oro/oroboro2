import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import Oroboro from '../../api/namespace';
import Files from '../../api/files/files';
import SvgFile from '../../api/files/classes/SvgFile';

import './OMenu';
import './OEditor.html';

Template.OEditor.onCreated(function() {
  this.layers = [];
  this.groups = [];
  this.items = [];

  this.setSelector = (selected) => {
    let item = selected.get('item');
    if(!item)
      return;
    Oroboro.selected = this.selected = item;
    //this.setClipboard(obj._svg.attr('id'));
    let elem = item._svg,
      { width, height, x, y } = elem.bbox();
    
    if(this.selector)
      this.selector.remove();
    this.selector = elem.parent().group()
      .attr('id', 'selector')
      .attr('role', 'selector');
    this.selector.rect(width, height)
      .x(x).y(y)
      .stroke({ color: '#000000', width: 1, dasharray: '5,5', opacity: 0.8 })
      .fill('none');
  }

  this.clearSelector = (e) => {
    if(this.selector) {
      // Do not delete selector if we click on it
      if(e && $(e.target).attr('role') == this.selector.attr('role'))
        return;
      this.selector.remove();
      this._file.clearSelected();
    }
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

  /*this.setSource = (svgSource) => {
    ItemFactory({ 
      type: 'SimplePath', closed: true,
      cache: svgSource
    }, SVG(editor));
  }*/

  /*this.setNewPath = () => {
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
  }*/

  this.autorun(() => {
    this._fileId = FlowRouter.getParam('file');
    if(this._fileId) {
      this.handleDefs = this.subscribe('Files.SvgFile.defs', this._fileId);
      this.handleNoDefs = this.subscribe('Files.SvgFile.nodefs', this._fileId);
    }
  });

  Oroboro.elem = this.items;
});

Template.OEditor.helpers({
  editor: function() {
    return Template.instance();
  }
});

Template.OEditor.onRendered(function() {
  this.editor = SVG('OEditor');

  this.autorun(() => {
    Files.find({ _id: this._fileId }).observe({
      added: (doc) => {
        this._file = new SvgFile(
          doc, this.editor, null, this.handleDefs, this.handleNoDefs
        ).onSelected(this.setSelector);
      }
    });
  });
});

Template.OEditor.events({
  'mousedown #OEditor': function(e, inst) {
    inst.clearSelector(e, inst);
  }
});