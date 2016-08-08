import React from 'react';
import Items from './Items';

const Groups = React.createClass({
  getDefaultProps() {
    return {
    }
  },
  render() {
    const { 
      canvasId, 
      addedItems, removedItems,
      onItemCreate
    } = this.props;
    const groups = [{_id: 'testGroup'}];

    return (
        <Items
          canvasId={ canvasId }
          addedItems={ addedItems } 
          removedItems={ removedItems }
          onItemCreate={ onItemCreate }
        />
    );
  }
});


export default Groups;