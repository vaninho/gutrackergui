import IconButton from '@mui/material/IconButton';
import Close from '@mui/icons-material/Close';
import Minimize from '@mui/icons-material/Minimize';
import Button from '@mui/material/Button';
import React from 'react';

export default class AppBar extends React.Component {

    constructor(props) {
        super(props)
        this.props = props
    }

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
                <Button variant='contained' size='small' style={appButton} onClick={() => { window.guApp.openDonatePage() }}>Donate</Button>

                <IconButton color="inherit" size="small" style={appButton}
                    onClick={() => window.guApp.windowMinimize(this.props.window)}>
                    <Minimize />
                </IconButton>
                <IconButton color="inherit" size="small" style={appButton}
                    onClick={() => window.guApp.windowClose(this.props.window)}>
                    <Close />
                </IconButton>
            </div>
        )
    }
}