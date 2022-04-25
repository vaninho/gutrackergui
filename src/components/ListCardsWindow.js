import React from 'react';
import AppBar from './app-bar';
import Button from '@mui/material/Button';

export default class ListCardsApp extends React.Component {


    constructor(props) {
        super(props)
        this.handleClick = this.handleClick.bind(this)
    }

    async handleClick(event) {
        const res = await window.guApp.getOpponentInfo()
        console.log(res)
    }


    render() {
        return (
            <div>
                <div>
                    <AppBar window='listCard' />
                </div>
                <div style={{ border: '1px solid BLACK' }}>
                    <Button variant='contained' size='small' onClick={this.handleClick}>Pegar Nickname do oponente</Button>
                </div>
            </div>
        );
    }
}
