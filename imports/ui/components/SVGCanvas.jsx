import React from 'react';
import Layers from './Layers';
import ItemFactory from '../../api/items/classes/ItemFactory';

const SVGCanvas = React.createClass({
  getDefaultProps() {
    return {
      container: 'OSVGCanvas'
    }
  },

  componentDidMount() {
    console.log('componentDidMount')
    const { container, addedItems, removedItems } = this.props;
    SVG(this.props.container);
    this.createSVG(addedItems, container);
  },

  componentWillUpdate(props) {
    console.log('componentWillUpdate')
    const { container, addedItems, removedItems } = props;
    this.createSVG(addedItems, container);
  },

  componentWillUnmount() {
    this.removeSVG();
  },

  createSVG(items, container) {
    const { onItemCreate, onItemClick } = this.props;
    this.removeSVG();
    //this.items = [];
    items.forEach(i => {
      let obj;
      if(Oroboro.waitOn[i._id]) {
        obj = Oroboro.waitOn[i._id];
        delete Oroboro.waitOn[i._id];
      }
      else {
        obj = ItemFactory(i).draw(container);
        if(!obj) {
          //console.log('element not inserted');
          return;
        }
      }

      obj._svg.on('click', function(e) {
        onItemClick(obj, e);
      });

      //this.items.push(obj);

      onItemCreate(obj);
    });
    /*let self = this;
    items.forEach((i, k) => {
      
    });*/
    //Oroboro.elem = this.items;
  },

  removeSVG() {
    if(this.items)
      this.items.forEach(i => {
        //i.update();
        i._svg.remove();
      });
  },

  render() {
    const { 
      container, 
      addedItems, removedItems,
      onLayerCreate, onGroupCreate, onItemCreate
    } = this.props;


    return (
      <svg 
        id={ container }
        width="100%"
        height="100%"
        style={ {overflow: 'visible'} } 
      >
      </svg>
    );
  }
});


export default SVGCanvas;