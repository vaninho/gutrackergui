import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import ReactDOMServer from 'react-dom/server'

export default class Card extends React.Component {

  constructor(props) {
    super(props)
    this.card = props.card
  }

  getRarityColor = () => {
    switch (this.card.rarity) {
      case 'common':
        return 'grey'
      case 'rare':
        return 'blue'
      case 'epic':
        return 'purple'
      case 'legendary':
        return 'orange'
    }
  }

  getGodColor = () => {
    switch (this.card.god) {
      case 'light':
        return 'Khaki'
      case 'nature':
        return 'SpringGreen'
      case 'deception':
        return 'MediumOrchid'
      case 'war':
        return 'Maroon'
      case 'mage':
        return 'PaleTurquoise'
      case 'death':
        return 'Turquoise'
      case 'neutral':
        return 'grey'
    }
  }

  getUrlImage = () => {
    return 'https://card.godsunchained.com/?id=' + this.card.prot.substring(1) + '&q=4&png=true'
  }


  render() {
    return (

      // Fazer border-right com a cor da raridade da classe - grey comum, blue rare, purple epic, orange legendary
      <li className='card-frame' style={{ borderRight: `5px solid ${this.getRarityColor()}` }} data-html={true} data-tip data-for={this.card.name.split(" ").join("")}>
        <ReactTooltip html={true} id={this.card.name.split(" ").join("")} effect='solid' className='tooltip'>
          {ReactDOMServer.renderToStaticMarkup(<img src={this.getUrlImage()} />)}
        </ReactTooltip>
        {/* Fazer as cores conforme a classe, Khaki - light, SpringGreen nature, MediumOrchid deception, Maroon war, PaleTurquoise mage, Turquoise death */}
        <span className='card-cost' style={{ backgroundColor: this.getGodColor() }}>{this.card.mana}</span>
        <span className='card-name'>{this.card.name}</span>
        <span className='card-count'>{this.card.count}</span>

      </li>

    )
  }
}