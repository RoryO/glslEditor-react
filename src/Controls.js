import React from 'react';
import Button from 'material-ui/Button';
import './Controls.css';

export default class Controls extends React.Component {
    render() {
        return(
          <div className="shaderControls">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
            rel="stylesheet" />
            <ul>
            <li>
            <Button onClick={this.props.toggleCallback}
                    color="primary">
              <i className="material-icons">{ this.props.paused ? 'play_arrow' : 'pause' }</i>
            </Button>
            </li>
            </ul>
        </div>
        );
    }
}
