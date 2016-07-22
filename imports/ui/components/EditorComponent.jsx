import React from 'react';

import { PathFactory } from '../../api/items/classes/pathClasses';

import Oroboro from '../../api/namespace';

export default EditorComponent = React.createClass({
  componentDidMount() {
    const { container, appProps } = this.props;
    const { items } = appProps;
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
    Oroboro.elem = this.items;
  },

  removeSVG() {
    if(this.items)
      this.items.forEach(i => {
        i._svg.remove();
      });
  },

  render() {
    //console.log(this.props);
    
    return (
      <g>
        <MenuComponent />
      </g>
    )
  }
});

MenuComponent = React.createClass({
  render() {
    return (
      <g>
        
      </g>
    );
  }
});//<circle r={ 20 } x={ 100 } y={ 100 } />