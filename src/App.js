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

    handleShaderErrorState = (e) => {
        this.setState({ error: e });
    }

    constructor(props) {
        super(props);
        this.state = { source: DEFAULT_FRAG_SHADER };
    }

    addError(args) {
        /* let re = /ERROR:\s+\d+:(\d+):\s+('.*)/g;
         * let matches = re.exec(args.error);
         * if (matches) {
         *     let line = parseInt(matches[1]) - 1;
         *     let er = matches[2];
         *     let msg = document.createElement('div');

         *     let icon = msg.appendChild(document.createElement('span'));
         *     icon.className = 'ge-error-icon';
         *     icon.innerHTML = 'x';
         *     msg.appendChild(document.createTextNode(er));
         *     msg.className = 'ge-error';
         *     this.widgets.push(this.main.editor.addLineWidget(line, msg));//, { coverGutter: false, noHScroll: true }));
         * }*/
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
                width="500"
                height="500"
                fragmentString={ this.state.source }
                handleShaderErrorState={ this.handleShaderErrorState }
            />
        </div>
        );
    }
}
