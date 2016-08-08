import React from 'react';

let types = [
  'simple',
  'spiro',
  'algo1',
];

const Menu = React.createClass({
  render() {
    const { freeOnStart, freeOnStop, changeType, onDelete, onInputChange } = this.props;
    const options = types.map(t => {
      return (<option key={ t } value={ t }>{ t }</option>)
    });

    return (
      <div>
        <button onClick={ onDelete }>Delete</button>
        <select id="menu" onChange={ changeType }>
          {options}
        </select>
        <FreePathButton onStart={ freeOnStart } onStop={ freeOnStop }/>
        <input ref='svgInput' type="text" onKeyPress={(e) => {(e.key === 'Enter' ? onInputChange(this.refs.svgInput.value) : null)}} />
      </div>
    );
  }
});

FreePathButton = React.createClass({
  getInitialState() {
    return {
      text: 'start',
    }
  },

  onClick() {
    if(this.state.text == 'start') {
      this.props.onStart();
      this.setState({ text: 'stop' })
    }
    else {
      this.props.onStop();
      this.setState({ text: 'start' })
    }
  },

  render() {
    return <ToggleButton onClick={ this.onClick } text={ this.state.text }/>
  }
});

ToggleButton = React.createClass({
  render() {
    return(
      <button onClick={ this.props.onClick }>{ this.props.text }</button>
    );
  }
});

export default Menu;