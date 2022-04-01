import React, { useState } from 'react';
import { getCardsPlayed, main } from '../core';
import Card from './card';
import axios from 'axios'
export default class CardList extends React.Component {

  constructor(props) {
    super(props)
    this.state = { deck: [] }
    this.updateDeck = this.updateDeck.bind(this)
  }

  async componentDidMount() {
    const deck = await main()
    if(deck.length > 0) {
      await this.fillDeckInfos(deck);
    }
    this.setState({ deck: deck })

    this.interval = setInterval(this.updateDeck, 30000)
  }

  async updateDeck() {
    console.log('updateDeck')
    let deck = this.state.deck
    if (deck.length == 0) {
      deck = await main()
    } else {
      if (deck.length > 0 && !deck.hasOwnProperty('god')) {
        await this.fillDeckInfos(deck)
      }
      deck = await getCardsPlayed(this.state.deck)
    }
    this.setState({ deck: deck })
  }
  async fillDeckInfos(deck) {
    for (var i = 0; i < deck.length; i++) {
      const response = await axios.get('https://api.godsunchained.com/v0/proto/' + deck[i].prot);
      deck[i].god = response.data.god;
      deck[i].rarity = response.data.rarity;
    }
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


