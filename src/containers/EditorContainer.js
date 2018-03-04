import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Editor from '../Editor';
import { sourceUpdate } from '../actions';

const mapStateToProps = (state) => {
    return {
        source: state.source,
        error: state.error
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        handleSourceCodeUpdate: bindActionCreators(sourceUpdate, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor);
