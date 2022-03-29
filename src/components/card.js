import React, { useState } from 'react';
export default class Card extends React.Component {

  constructor(props) {
    super(props)
    this.card = props.card
  }

  render() {
    return (
      // Fazer border-right com a cor da raridade da classe - grey comum, blue rare, purple epic, orange legendary
      <li className='card-frame'> 
        {/* Fazer as cores conforme a classe, Khaki - light, SpringGreen nature, MediumOrchid deception, Maroon war, PaleTurquoise mage, Turquoise death */}
        <span className='card-cost' style={{backgroundColor: 'Khaki'}}>{this.card.mana}</span>
        <span className='card-name'>{this.card.name}</span>
        <span className='card-count'>{this.card.count}</span>
      </li>
    )
  }
}