a = [{'name': 'oi', mana: 3}, {'name': 'oi2', mana: 2}, {'name': 'oi3', mana: 1}]
console.log(a.sort((a,b) => {return a.mana > b.mana ? 1: -1}))