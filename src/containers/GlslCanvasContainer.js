import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import GlslCanvas from '../GlslCanvas.js';
import { compileError } from '../actions';

const mapStateToProps = (state, props) => {
    return {
        fragmentString: state.source,
        lastCharacter: state.lastCharacter,
        width: state.canvasOptions.width,
        height: state.canvasOptions.height,
        overSample: state.canvasOptions.overSample
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleShaderErrorState: bindActionCreators(compileError, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GlslCanvas);
