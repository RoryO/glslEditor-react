import React from 'react';

import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import MenuIcon from 'material-ui-icons/Menu';

export default (props) => {
    return(
    <Toolbar>
        <Button onClick={ props.toggleDrawer }
                mini
                color="primary">
            <MenuIcon />
        </Button>
    </Toolbar>
    );
}
