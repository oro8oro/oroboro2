import React from 'react';
import { Link } from 'react-router';
import Editor from './Editor.jsx';

import { UI_ROOT } from '../../api/api';

const App = React.createClass({
  render() {
    const { notEmpty, addedItems, removedItems } = this.props;;

    if(!notEmpty)
      return null;

    return (
      <Editor addedItems={ addedItems }
        removedItems={ removedItems }
      />
    );
  }
});

export default App