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

        await window.guApp.ping()

        const deck = await window.guApp.getDeck()
        this.setState({ deck: deck })
        if (deck.length !== 0) {
            window.guApp.showCardListWindow()
        }

        setInterval(this.updateDeck, 10000)
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
                            {this.state.deck != 0 && this.state.deck.map((card) => {
                                return <Card card={card} key={(card.name + '' + card.count)} />
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}
