import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';
import Minimize from '@material-ui/icons/Minimize';
import Button from '@material-ui/core/Button';
import React from 'react';


// Capture Electron Main Window 
const { remote } = require('electron')
var window = remote.getCurrentWindow()

export default class AppBar extends React.Component {

    render() {
        // Styles
        const appBarStyle = {
            WebkitAppRegion: "drag",
            zIndex: 1000,
            maxHeight: 20,
            padding: 6,
            paddingTop: 10,
            paddingBottom: 10,
            height: 100,
            color: "#f5f5f5",
            backgroundColor: "#494440",
            display: "flex",
            alignItems: "center",
            userSelect: "none",
        }
        const appButton = {
            WebkitAppRegion: "no-drag"
        }
        const appH1 = {
            flexGrow: 1,
            margin: 0,
            marginLeft: 6,
            fontSize: 16
        }

        return (
            <div style={appBarStyle}>
                <h1 style={appH1}>GU Tracker</h1>
                <Button variant='contained' size='small' style={appButton} onClick={()=>{require('electron').shell.openExternal('https://www.paypal.com/donate/?hosted_button_id=KMYN4WU5L8FJ8')}}>Donate</Button>

                <IconButton color="inherit" size="small" style={appButton}
                    onClick={() => { window.minimize() }}>
                    <Minimize />
                </IconButton>
                <IconButton color="inherit" size="small" style={appButton}
                    onClick={() => { window.close() }}>
                    <Close />
                </IconButton>
            </div>
        )
    }
}