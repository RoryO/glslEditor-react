import React from 'react';
import GlslCanvas from 'glslCanvas';

import './Shader.css';

export default class Shader extends React.Component {
    static defaultProps = {
        width: 250,
        height:250,
        source: ''
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.source !== nextProps.source) {
            this.glslCanvas.load(nextProps.source);
        }
    }

    componentDidMount() {
        this.glslCanvas = new GlslCanvas(this.canvas);
        this.glslCanvas.load(this.props.source);
    }

    render() {
        return(
        <canvas
            className="glslCanvas"
            width={this.props.width}
            height={this.props.height}
            ref={(me) => { this.canvas = me; } }>
        </canvas>
        );
    }
}
