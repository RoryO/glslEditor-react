import React from 'react';
import Editor, { EMPTY_FRAG_SHADER } from './Editor.js';
import Shader from './Shader.js';
import './App.css';

export default class App extends React.Component {
    handleSourceCodeUpdate = (updatedCode) => {
        this.setState({ source: updatedCode });
    }

    handleOptionsUpdate = (options) => {
        this.setState({ options: options });
    }

    handleShaderError = (error) => {
        this.setState({errors: error});
    };

    constructor(props) {
        super(props);
        this.state = { source: EMPTY_FRAG_SHADER };
    }

    render() {
        return (
        <div className="App">
            <Editor
                source={ this.state.source }
                handleSourceCodeUpdate={ this.handleSourceCodeUpdate }
                errors={ this.state.errors }
            />
            <Shader
                source={ this.state.source }
                handleShaderError={ this.handleShaderError }
            />
        </div>
        );
    }
}
