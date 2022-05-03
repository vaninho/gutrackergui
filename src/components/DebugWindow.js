import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AppBar from './app-bar';
import Button from '@mui/material/Button';

export default class DebugWindow extends React.Component {

    constructor(props) {
        super(props)
        this.state = { messages: '' }
        this.handleButton = this.handleButton.bind(this)
    }

    handleButton(event) {
        window.guApp.copyToClipBoard(this.state.messages)
    }

    componentDidMount() {
        window.guApp.ipcRendererOn((msg) => {
            console.log('CHAMOU')
            console.log(msg)
            const messages = this.state.messages + '\n' + msg
            this.setState({ messages: messages })
        })
    }


    render() {
        return (
            <Dialog fullScreen={Boolean("true")} open={Boolean("true")}>
                <DialogTitle style={{ padding: 0 }}>
                    <AppBar window='debug' />
                </DialogTitle>

                <DialogContent className={'mainContent'}>
                    <Button size='big' onClick={this.handleButton}>Copy to clipboard</Button>
                    <div className='scroll'>
                        {this.state.messages}
                    </div>
                </DialogContent>
            </Dialog>
        )
    }
}
