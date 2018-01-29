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
    handleSourceCodeUpdate = (updatedCode, lastCharacterInput) => {
        this.setState({ source: updatedCode, lastCharacter: lastCharacterInput });
    }

    handleOptionsUpdate = (options) => {
        this.setState({ options: options });
    }

    handleShaderErrorState = (e) => {
        this.setState({ error: e });
    }

    autosave = () => {
        this.storage.autosave = this.state.source;
        window.setTimeout(this.autosave, 120000);
    }

    constructor(props) {
        super(props);
        // need a valid shader on the first frame. otherwise we crash because the
        // handler for the shader compiler editor is not set up yet.
        this.state = { source: DEFAULT_FRAG_SHADER };
    }

    componentDidMount() {
        this.storage = window.localStorage;
        const initialState = this.storage.autosave ? this.storage.autosave : DEFAULT_FRAG_SHADER;
        // lastCharacter is ; as a hack to force first frame render
        // temporary until we have control of forcing a compile from the outside
        this.setState({ source: initialState, lastCharacter: ';' });
        window.setTimeout(this.autosave, 120000);
    }

    render() {
        return (
        <div className="App">
            <Editor
                source={ this.state.source }
                handleSourceCodeUpdate={ this.handleSourceCodeUpdate }
                error={ this.state.error }
            />
            <GlslCanvas
                width="800"
                height="1000"
                overSample="2"
                fragmentString={ this.state.source }
                lastCharacter={ this.state.lastCharacter }
                handleShaderErrorState={ this.handleShaderErrorState }
            />
        </div>
        );
    }
}
