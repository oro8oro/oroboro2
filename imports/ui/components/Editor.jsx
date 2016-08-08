import React from 'react';
import Oroboro from '../../api/namespace';
import ItemFactory from '../../api/items/classes/ItemFactory';
import SVGCanvas from './SVGCanvas';
import Menu from './Menu';


const Editor = React.createClass({
  getDefaultProps() {
    return {
      container: 'OContainer'
    }
  },

  componentWillMount() {
    this.layers = [];
    this.groups = [];
    this.items = [];
  },

  componentDidMount() {
    this.setListeners();
  },

  setListeners() {
    this.selectorListener();
  },

  setClipboard(text) {
    this.selectedText = text;
    let textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    this.copySelectionText();
    document.body.removeChild(textArea);
  },

  selectorListener() {
    const { container } = this.props;
    $('#' + container).on('mousedown', this.clearSelector);
  },

  // SVG elem and Path item
  setSelector(item) {
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
  },

  clearSelector(e) {
    if(this.selector) {
      // Do not delete selector if we click on it
      if(e && $(e.target).attr('role') == this.selector.attr('role'))
        return;
      this.selector.remove();
      delete this.selector;
    }
  },

  copySelectionText(){
    var copysuccess
    try{
        copysuccess = document.execCommand("copy") // run command to copy selected text to clipboard
    } catch(e){
        copysuccess = false
    }
    return copysuccess
  },

  setNewPath() {
    ItemFactory({ 
      type: 'SimplePath', closed: true
    }, SVG(this.props.container));
  },

  setFreeDraw(ev) {
    console.log('setFreeDraw');
    const { items } = this;
    console.log(items[items.length-1])
    items[items.length-1].add([ev.pageX, ev.pageY]);
  },

  freeOnStart() {
    console.log('freeOnStart')
    const { container } = this.props;
    this.setNewPath();
    $('#' + container).on('click', this.setFreeDraw);
  },

  freeOnStop() {
    console.log('freeOnStop')
    const { container } = this.props;
    $('#' + container).off('click', this.setFreeDraw);
  },

  changeType(e, a) {
    const { items } = this;
    items[items.length-1].type = $(e.target).val()
  },

  onDelete() {
    let id = this.selectedText;
    let { items } = this;
    this.selectedText = null;
    //console.log('id to delete: ' + id)
    items = items.filter(i => {
      if(i._id != id)
        return true;
      i.delete();
      return false;
    });
  },

  onInputChange(svgSource) {
    if(!svgSource)
      return;
    ItemFactory({ 
      type: 'SimplePath', closed: true,
      cache: svgSource
    }, SVG(this.props.container));
  },

  onLayerCreate(inst) {
    this.layers.push(inst);
  },

  onGroupCreate(inst) {
    this.groups.push(inst);
  },

  onItemCreate(inst) {
    this.items.push(inst);
  },

  onItemClick(inst, e) {
    this.setClipboard(inst._svg.attr('id'));
    this.setSelector(inst);
    let self = this;
    /*inst.addListener('dragmove', function(e, svg, inst) {
      self.selector.remove();
      self.setSelector(inst);
    });*/
  },

  render() {
    const { container, addedItems, removedItems } = this.props;
    const { onLayerCreate, onGroupCreate, onItemCreate, onItemClick } = this;

    return (
      <div className="full">
        <svg 
          id={ container }
          width="100%"
          height="100%"
          style={ {overflow: 'visible'} } 
        >
          <SVGCanvas 
            editorId={ container }
            addedItems={ addedItems } 
            removedItems={ removedItems }
            onLayerCreate={ onLayerCreate }
            onGroupCreate={ onGroupCreate }
            onItemCreate={ onItemCreate }
            onItemClick={ onItemClick }
          />
        </svg>
        <Menu
          freeOnStart={ this.freeOnStart } 
          freeOnStop={ this.freeOnStop }
          changeType = { this.changeType }
          onDelete = { this.onDelete }
          onInputChange={ this.onInputChange }
        />
      </div>
    )
  }
});

export default Editor;