import React, { useState } from 'react';
import { getCardsPlayed, main } from '../core';
export default class DeckList extends React.Component {

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
    if(deck.length == 0) {
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
        <div align="center" className='deck-list'>
          {this.state.deck.length != 0 && this.state.deck.map((i, index) => (
            <div key={i.name} className='card'>
              <div className='card-mana'>{i.mana}</div>
              <div className='card-name'>{i.name}</div>
              <div className='card-count'>{i.count}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }
}