import React from 'react';
import { Link } from 'react-router';
import EditorComponent from './EditorComponent.jsx';

import { UI_ROOT } from '../../api/api';

export default AppComponent = React.createClass({
  render() {
    const { notEmpty } = this.props;;

    if(!notEmpty)
      return null;

    return (
      <EditorComponent appProps={ this.props } />
    );
  }
});

//xmlns="http://www.w3.org/2000/svg"
        //xmlnsXlink="http://www.w3.org/1999/xlink"

//