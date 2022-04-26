import React from 'react';
import AppBar from './app-bar';
import Card from './card'

export default class ListCardsApp extends React.Component {

    constructor(props) {
        super(props)
        this.state = { deck: [] }
        this.updateDeck = this.updateDeck.bind(this)
    }

    async componentDidMount() {
        console.log('componentMount')
        const deck = await window.guApp.getDeck()
        this.setState({ deck: deck })
        if (deck.length !== 0) {
            window.guApp.showCardListWindow()
        }

        setInterval(this.updateDeck, 20000)
    }

    async updateDeck() {
        let deck = this.state.deck
        deck = deck.length == 0 ? await window.guApp.getDeck() : await window.guApp.removeCardsPlayed(deck)
        this.setState({ deck: deck })
    }

    render() {
        return (
            <div>
                <div>
                    <AppBar window='listCard' />
                </div>
                <div>
                    <div className='card-list'>
                        <ul className='deck-class'>
                            {this.state.deck != 0 && this.state.deck.map((i) => {
                                return <Card card={i} key={(i.name + '' +i.count)} />
                            })}
                        </ul>
                    </div>
                    <h1 id='teste'></h1>
                </div>
            </div>
        );
    }
}
