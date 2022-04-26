import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AppBar from './app-bar';
import Button from '@mui/material/Button';

export default class MainWindow extends React.Component {

    constructor(props) {
        super(props)
        this.verifyGameStart = this.verifyGameStart.bind(this)
    }

    async componentDidMount() {
        window.guApp.getOpponentInfo()
        setInterval(this.verifyGameStart, 20000)
    }

    async verifyGameStart() {
        window.guApp.getOpponentInfo()
    }

    render() {
        return (
            <Dialog fullScreen={Boolean("true")} open={Boolean("true")}>
                <DialogTitle style={{ padding: 0 }}>
                    <AppBar window='main' />
                </DialogTitle>

                <DialogContent className={'mainContent'}>
                    <Button variant='contained' size='small' onClick={() => { window.guApp.openCardListWindow() }}>Open CardList</Button>
                </DialogContent>
            </Dialog>
        )
    }
}
