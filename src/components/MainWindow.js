import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import AppBar from './app-bar';
import HelpOutline from '@mui/icons-material/HelpOutline';
import { Divider, Tooltip } from '@mui/material';
import { ResetTv } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

export default class MainWindow extends React.Component {


    Root = styled('div')(({ theme }) => ({
        width: '100%',
        ...theme.typography.body2,
        '& > :not(style) + :not(style)': {
            marginTop: theme.spacing(2),
        },
    }));

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
                        <this.Root>
                            <Divider>
                                Cards List Window
                            </Divider>
                            <Button variant='contained' startIcon={<ResetTv />}>Reset</Button>
                            <Tooltip title='Reset the location of Cards List Window to default.'>
                                <HelpOutline fontSize='small' />
                            </Tooltip>
                            <Button variant='contained' startIcon={<ResetTv />}>Set</Button>
                            <Tooltip title='Open the Card List Window, then you can drag the window to location you prefer, after that you can close the window to save.'>
                                <HelpOutline fontSize='small' />
                            </Tooltip>
                        </this.Root>
                    </div>
                    <div>
                        <Button variant='contained' onClick={this.handleDebugButton}>Open Debug</Button>
                        <Tooltip title='Use this button if your tracker is not working, it will open a new Window debugging the tracker.'>
                            <HelpOutline fontSize='small' />
                        </Tooltip>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }
}
