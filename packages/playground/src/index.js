import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import LightSwitch from './LightSwitch';
import Select from './Select';

class App extends React.Component {
  state = {
    screen: 'select',
  };

  changeScreen = screen => () => this.setState({ screen });

  render() {
    const { screen } = this.state;
    return (
      <div
        style={{
          fontSize: '14px',
          fontFamily: 'monospace',
        }}
      >
        <header>
          <a
            onClick={this.changeScreen('select')}
            href="#"
            style={{ margin: '0 5px' }}
          >
            [{screen === 'select' ? 'X' : ''}]Select
          </a>
          <a
            onClick={this.changeScreen('light-switch')}
            href="#"
            style={{ margin: '0 5px' }}
          >
            [{screen === 'light-switch' ? 'X' : ''}]Light Switch
          </a>
        </header>
        <div
          style={{
            padding: '20px',
          }}
        >
          {screen === 'light-switch' ? <LightSwitch /> : null}
          {screen === 'select' ? <Select /> : null}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
