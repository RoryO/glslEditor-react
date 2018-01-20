import React from 'react';
import './Controls.css';

export default class Controls extends React.Component {
    render() {
        return(
          <div className="shaderControls">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet" />
            <ul>
            <li>
            <button onClick={this.props.toggleCallback}>
              <i className="material-icons">{ this.props.paused ? 'play_arrow' : 'pause' }</i>
            </button>
            </li>
            </ul>
        </div>
        );
    }
}
