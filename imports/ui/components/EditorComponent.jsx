import React from 'react';
import Oroboro from '../../api/namespace';
import { PathFactory } from '../../api/items/classes/pathClasses';
import MenuComponent from './MenuComponent';


export default EditorComponent = React.createClass({
  getDefaultProps() {
    return {
      container: 'OContainer'
    }
  },

  componentDidMount() {
    const { container, appProps } = this.props;
    const { items } = appProps;
    SVG(this.props.container);
    this.createSVG(items, container);
  },

  componentWillUpdate(props) {
    const { container, appProps } = props;
    const { items } = appProps;
    this.createSVG(items, container);
  },

  componentWillUnmount() {
    this.removeSVG();
  },

  createSVG(items, container) {
    this.removeSVG();
    this.items = items.map(i => {
      if(Oroboro.waitOn[i._id]) {
        let obj = Oroboro.waitOn[i._id];
        delete Oroboro.waitOn[i._id];
        //console.log(obj);
        return obj;
      }
      else
        return PathFactory(i).draw(container);
    });
    let self = this;
    this.items.forEach(i => {
      i._svg.on('click', function(e) {
        self.setClipboard(this.attr('id'));
      });
    })
    Oroboro.elem = this.items;
  },

  removeSVG() {
    if(this.items)
      this.items.forEach(i => {
        //i.update();
        i._svg.remove();
      });
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
    PathFactory({ 
      type: 'SimplePath', closed: true
    }, SVG(this.props.container));
  },

  setFreeDraw(ev) {
    console.log('setFreeDraw');
    const { items } = this;
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
    console.log('id to delete: ' + id)
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
    PathFactory({ 
      type: 'SimplePath', closed: true,
      cache: svgSource
    }, SVG(this.props.container));
  },

  render() {
    //console.log(this.props);
    const { container } = this.props;

    return (
      <div className="full">
        <svg 
          id={ container }
          width="100%"
          height="100%"
          style={ {overflow: 'visible'} } 
        >
        </svg>
        <MenuComponent 
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