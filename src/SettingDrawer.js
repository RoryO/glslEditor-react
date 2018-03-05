import React from 'react';
import Drawer from 'material-ui/Drawer';
import List, { ListItem, ListItemText } from 'material-ui/List';
import Button from 'material-ui/Button';
import ChevronLeftIcon from 'material-ui-icons/ChevronLeft'

export default (props) => {
    return(
    <Drawer open={ props.drawerOpen }>
        <List component="nav">
            <Button onClick={ props.toggleDrawer }>
                <ChevronLeftIcon />
            </Button>
        </List>
    </Drawer>
    );
}
