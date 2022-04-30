import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AppBar from './app-bar';
import TextareaAutosize from '@mui/material/TextareaAutosize';

export default class MainWindow extends React.Component {

    constructor(props) {
        super(props)
        this.state = { messages: 'Ola Voce' }
    }

    componentDidMount() {
        window.guApp.ipcRendererOn((msg) => {
            console.log('CHAMOU')
            console.log(msg)
            const messages = this.state.messages + '\n' + msg
            this.setState({messages: messages})
        })
    }


    render() {
        return (
            <Dialog fullScreen={Boolean("true")} open={Boolean("true")}>
                <DialogTitle style={{ padding: 0 }}>
                    <AppBar window='main' />
                </DialogTitle>

                <DialogContent className={'mainContent'}>
                    <h1>{this.state.messages}</h1>
                </DialogContent>
            </Dialog>
        )
    }
}
