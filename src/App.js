import React from 'react';
import Editor from './Editor.js';
import GlslCanvas from './GlslCanvas.js';
import './App.css';


const DEFAULT_FRAG_SHADER = `// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    vec3 color = vec3(0.);
    color = vec3(st.x,st.y,abs(sin(u_time)));

    gl_FragColor = vec4(color,1.0);
}`;

export default class App extends React.Component {
    handleSourceCodeUpdate = (updatedCode) => {
        this.setState({ source: updatedCode });
    }

    handleOptionsUpdate = (options) => {
        this.setState({ options: options });
    }

    handleShaderError = (error) => {
    }

    constructor(props) {
        super(props);
        this.state = { source: DEFAULT_FRAG_SHADER };
    }

    render() {
        return (
        <div className="App">
            <Editor
                source={ this.state.source }
                handleSourceCodeUpdate={ this.handleSourceCodeUpdate }
                errors={ this.state.errors }
            />
            <GlslCanvas
                width="500"
                height="500"
                fragmentString={ this.state.source }
                handleShaderError={ this.handleShaderError }
            />
        </div>
        );
    }
}
