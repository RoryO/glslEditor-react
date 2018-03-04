import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import EditorContainer from './containers/EditorContainer';
import GlslCanvasContainer from './containers/GlslCanvasContainer';
import * as ActionTypes from './ActionTypes';

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

const initialState = {
    source: window.localStorage.autosave ? window.localStorage.autosave : DEFAULT_FRAG_SHADER,
    lastCharacter: '',
    error: null,
    canvasOptions: {
        width: 800,
        height: 1000,
        overSample: 2
    }
};

const reducer = (state, action) => {
    if (typeof state === 'undefined') { return initialState; }
    switch(action.type) {
        case ActionTypes.SOURCE_UPDATE:
            return Object.assign({}, state, {
                source: action.source,
                lastCharacter: action.lastCharacter
            });
        case ActionTypes.OPTIONS_UPDATE:
            return Object.assign({}, state, {
                canvasOptions: {
                    width: action.width,
                    height: action.height,
                    overSample: action.overSample
                }
            });
        case ActionTypes.ERROR_UPDATE:
            return Object.assign({}, state, {
                error: action.error
            });
        default:
            return Object.assign({}, state, {});
    }

};

const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const autosave = () => {
    debugger
    window.localStorage.autosave = store.getState().source;
    window.setTimeout(this.autosave, 120000);
}

window.setTimeout(autosave, 120000);

export default () => {
    return (
    <Provider store={ store }>
        <div className="App">
            <EditorContainer />
            <GlslCanvasContainer />
        </div>
    </Provider>
    );
}
