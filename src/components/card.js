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
      case 'magic':
        return 'PaleTurquoise'
      case 'death':
        return 'Turquoise'
      case 'neutral':
        return 'grey'
    }
  }

  getUrlImage = () => {
    return 'https://card.godsunchained.com/?id=' + this.card.prot + '&q=4&png=true&format=card'
  }


  render() {
    return (

      <li className='card-frame' style={{
        borderRight: `5px solid ${this.getRarityColor()}`,
        backgroundImage: `linear-gradient(to left, transparent,#1d1d1d), url('https://images.godsunchained.com/art2/250/${this.card.prot}.jpg')`,
        backgroundPosition: 'right',
        backgroundPositionY: '20%',
        backgroundRepeat: 'no-repeat'
      }} data-html={true} data-tip data-for={this.card.name.split(" ").join("")}>
        <ReactTooltip className='tooltip' html={true} id={this.card.name.split(" ").join("")} effect='solid' >
          {ReactDOMServer.renderToStaticMarkup(<img src={this.getUrlImage()} width='200px' height='auto' />)}
        </ReactTooltip>
        <span className='card-cost' style={{ backgroundColor: this.getGodColor() }}>{this.card.mana}</span>
        <span className='card-name'>{this.card.name}</span>
        <span className='card-count'>{this.card.count}</span>

      </li>

    )
  }
}