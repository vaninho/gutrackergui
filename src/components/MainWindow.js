import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AppBar from './app-bar';
import TextareaAutosize from '@mui/material/TextareaAutosize';

export default class MainWindow extends React.Component {

    constructor(props) {
        super(props)
    }


    render() {
        return (
            <Dialog fullScreen={Boolean("true")} open={Boolean("true")}>
                <DialogTitle style={{ padding: 0 }}>
                    <AppBar window='main' />
                </DialogTitle>

                <DialogContent className={'mainContent'}>
                    <h1>Hello!</h1>
                </DialogContent>
            </Dialog>
        )
    }
}
