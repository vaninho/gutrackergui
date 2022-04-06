import React from 'react';
import { getDeck, removeCardsPlayed } from '../core';
import Card from './card';
export default class CardList extends React.Component {

  constructor(props) {
    super(props)
    this.state = { deck: [] }
    this.updateDeck = this.updateDeck.bind(this)
  }

  async componentDidMount() {
    const deck = await getDeck()
    this.setState({ deck: deck })

    this.interval = setInterval(this.updateDeck, 10000)
  }

  async updateDeck() {
    let deck = this.state.deck
    deck.length == 0 ? await getDeck() : await removeCardsPlayed(this.state.deck)
    this.setState({ deck: deck })
  }

  render() {
    return (
      <div>
        <span hidden={!(this.state.deck.length == 0)}>Waiting to game start...</span>
        <div className='card-list'>
          <ul className='deck-class'>
            {this.state.deck != 0 && this.state.deck.map((i) => {
              return <Card card={i} key={i.name} />
            })}
          </ul>
        </div>
      </div>
    )
  }
}


