import React from 'react';

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