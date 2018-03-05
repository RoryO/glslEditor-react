import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import SettingDrawer from '../SettingDrawer';
import { toggleDrawer } from '../actions';

const mapStateToProps = (state) => {
    return {
        drawerOpen: state.ui.drawerOpen
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
       toggleDrawer: bindActionCreators(toggleDrawer, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingDrawer);
