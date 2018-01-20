import React from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import './Editor.css';

import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/wrap/hardwrap';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/display/rulers';
import 'codemirror/addon/display/panel';
import 'codemirror/mode/javascript/javascript';

import 'codemirror/keymap/sublime';

import 'codemirror/mode/clike/clike.js';

const DEFAULT_OPTIONS = {
    viewportMargin: Infinity,
    mode: 'x-shader/x-fragment',
    keyMap: 'sublime',
    theme: 'monokai',
    lineNumbers: true,
    gutters: ['CodeMirror-linenumbers', 'breakpoints'],
    extraKeys: { 'Ctrl-Space': 'autocomplete' },
    lineWrapping: true,
};

export default class Editor extends React.Component {
    static defaultProps = {
        options: DEFAULT_OPTIONS,
        source: ''
    }

    componentDidMount() {
        this.props.handleSourceCodeUpdate(this.props.source);
    }

    render() {
        return (
        <CodeMirror
            value={this.props.source}
            options={this.props.options}
            onBeforeChange={(editor, data, value) => {
                this.props.handleSourceCodeUpdate(value);
            }}
            onChange={(editor, data, value) => {
            }}
        />
        );
    }
}
