import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import AppBar from './components/app-bar';
import DeckList from './components/deck-list';

export default class App extends React.Component {

    render() {
        return (
            <div>
                <Dialog fullScreen={Boolean("true")} open={Boolean("true")}>
                    <DialogTitle style={{ padding: 0 }}>
                        <AppBar />
                    </DialogTitle>

                    <DialogContent className={'mainContent'}>
                        <DeckList />
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
}
