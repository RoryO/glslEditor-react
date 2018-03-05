import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Toolbar from '../Toolbar';
import { toggleDrawer } from '../actions';

const mapStateToProps = (state) => {
    return { };
}

const mapDispatchToProps = (dispatch) => {
    return {
        toggleDrawer: bindActionCreators(toggleDrawer, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
