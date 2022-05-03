import React from 'react';
import ReactDOM from 'react-dom';
import DebugWindow from './components/DebugWindow';
import ListCardsWindow from './components/ListCardsWindow';
import MainWindow from './components/MainWindow';
import './index.css'

let url = window.location.href
url = url.replace('\\', '/')
url = url.replace('/index.html', '')
url = url.substring(url.lastIndexOf('/'))
const rootElement = document.getElementById('root')
ReactDOM.render(
    url == '/main_window' ? <MainWindow /> : (url == 'list_cards_window' ? <ListCardsWindow /> : <DebugWindow />)
    , rootElement);
