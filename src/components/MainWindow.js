import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import AppBar from './app-bar';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { Tooltip } from '@mui/material';

export default class MainWindow extends React.Component {

    constructor(props) {
        super(props)
        this.handleButton = this.handleDebugButton.bind(this)
    }

    handleDebugButton(event) {
        console.log('handleButton MAIN')
        window.guApp.openDebugWindow()
    }

    render() {
        return (
            <Dialog fullScreen={Boolean("true")} open={Boolean("true")}>
                <DialogTitle style={{ padding: 0 }}>
                    <AppBar window='main' />
                </DialogTitle>

                <DialogContent className={'mainContent'}>
                    <div>
                        <Button variant='contained' onClick={this.handleDebugButton}>Open Debug</Button>
                        <Tooltip title='Use this button if your tracker is not working, it will open a new Window debugging the tracker.'>
                            <HelpOutline fontSize='small' />
                        </Tooltip>
                    </div>
                    <p>Hello everyone, welcome to GU Tracker v2.</p>
                    <p>In this version the tracker window will be openning when the match starts, he will appears a few secounds after both player choose the god power. This window here is the main window, keep it opened (can be minimized) to stay tracking, close if want to close this software.</p>
                    <p>In case your tracker isnt working, like not openning the new window, please click on Open Debug button and wait a little bit, then you can click on Button 'Copy to clipboard' and paste the text on websites like https://pastebin.com, and send the link to my email. vaninho@gmail.com.</p>
                    <p>That's it, I hope you enjoy the tracker.</p>
                    <p>created by Vanio Meurer (vaninho) - 2022</p>
                </DialogContent>
            </Dialog >
        )
    }
}
