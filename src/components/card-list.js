import React, { useState } from 'react';
import { getCardsPlayed, main } from '../core';
import Card from './card';
export default class CardList extends React.Component {

  constructor(props) {
    super(props)
    this.state = { deck: [] }
    this.updateDeck = this.updateDeck.bind(this)
  }

  async componentDidMount() {
    const deck = await main()
    this.setState({ deck: deck })

    this.interval = setInterval(this.updateDeck, 30000)
  }

  async updateDeck() {
    console.log('updateDeck')
    let deck = this.state.deck
    if (deck.length == 0) {
      deck = await main()
    } else {
      deck = await getCardsPlayed(this.state.deck)
    }
    this.setState({ deck: deck })
  }

  render() {
    return (
      <div>
        <span hidden={!(this.state.deck.length == 0)}>Aguardando jogo começar...</span>
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