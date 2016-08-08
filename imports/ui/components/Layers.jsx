import React from 'react';
import SVG from 'svg.js';
import Groups from './Groups';

const Layers = React.createClass({
  getDefaultProps() {
    return {
    }
  },

  componentDidMount() {
    let parent = SVG.get(this.props.parent);
    console.log(parent)
    parent.group
  },

  render() {
    const { 
      parent, 
      addedItems, removedItems,
      onGroupCreate, onItemCreate
    } = this.props;
    return (
      <Groups
        parent={ parent }
        addedItems={ addedItems } 
        removedItems={ removedItems }
        onGroupCreate={ onGroupCreate }
        onItemCreate={ onItemCreate }
      />
    );
  }
});


export default Layers;