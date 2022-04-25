import { border } from '@mui/system';
import React from 'react';
import AppBar from './app-bar';

export default class ListCardsApp extends React.Component {

    render() {
        return (
            <div>
                <div>
                    <AppBar window='main' />
                </div>
                <div style={{border: '1px solid BLACK'}}>
                    
                </div>
            </div>
        );
    }
}
