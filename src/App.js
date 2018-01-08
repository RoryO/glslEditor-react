import React from 'react';
import Editor from './Editor.js';
import Shader from './Shader.js';
import './App.css';

export default class App extends React.Component {
    handleSourceCodeUpdate = (updatedCode) => {
        this.setState({ value: updatedCode });
    }

    handleOptionsUpdate = (options) => {
        this.setState({ options: options });
    }

    constructor(props) {
        super(props);
        this.state = { };
    }

    render() {
        return (
        <div className="App">
            <Editor
                value={ this.state.value }
                handleSourceCodeUpdate={ this.handleSourceCodeUpdate }
            />
            <Shader
                source={ this.state.value }
            />
        </div>
        );
    }
}
