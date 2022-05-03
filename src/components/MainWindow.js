import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import AppBar from './app-bar';

export default class MainWindow extends React.Component {

    constructor(props) {
        super(props)
        this.handleButton = this.handleButton.bind(this)
    }

    handleButton(event) {
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
                    <Button size='big' onClick={this.handleButton}>Debug</Button>
                </DialogContent>
            </Dialog>
        )
    }
}
