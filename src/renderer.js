import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import ListCardsWindow from './components/ListCardsWindow';
import MainWindow from './components/MainWindow';
import './index.css'


const rootElement = document.getElementById('root')
ReactDOM.render(
    <BrowserRouter>
        <Routes>
            <Route path='main_window' element={<MainWindow />} />
            <Route path='list_cards_window' element={<ListCardsWindow />} />
        </Routes>
    </BrowserRouter>, rootElement);