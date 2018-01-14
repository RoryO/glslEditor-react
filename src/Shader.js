import React from 'react';
import GlslCanvas from './GlslCanvas';

import './Shader.css';

export default class Shader extends React.Component {
    static defaultProps = {
        width: 500,
        height: 500,
        source: ''
    }

    handleShaderError(e) {
        if (this.props.handleShaderError) {
            this.props.handleShaderError(e.error);
        }
    }

    render() {
        return(
        <GlslCanvas
            width={this.props.width}
            height={this.props.height}
            fragmentString={this.props.source}
        />
            /* <canvas
             *     className="glslCanvas"
             *     width={this.props.width}
             *     height={this.props.height}
             *     ref={(me) => { this.canvas = me; } }>
             * </canvas>*/
        );
    }
}
