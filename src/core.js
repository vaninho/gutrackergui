const fs = require('fs')
const os = require('os')
const readLine = require('readline')
const puppeteer = require('puppeteer')
const fsR = require('fs-reverse')
const readLastLines = require('read-last-lines');
const axios = require('axios')

const PATH_MASTERLOG = '/AppData/LocalLow/FuelGames/gods/logs/latest/master.txt'
const PATTERN_ENEMY_PLAYER_NAME = "player 1 name: '"
const PATTERN_TARGETDATA = 'TargetData:'
const PATTERN_ENEMY_PLAYERID = "playerID:'" // dont forget the ', since its important to index
const PATTERN_TARGETGOD = "targetGod:'" // dont forget the ', since its important to index
const PATTERN_LOCAL_PLAYERID = 'Sending RegisterPlayer msg... apolloID: '
const PATTERN_LAST_LINE = 'Settings.ini successfully saved'
const PATTERN_ENEMY_CARD_PLAYED = 'CombatRecorder: {enemyName} -> Event: Played | Card: ' // need to replace the enemyName in execution
let PATTERN_ENEMY_CARD_PLAYED_CHANGED = ''
const URL_GUDECKS_PLAYERSTATS = 'https://gudecks.com/meta/player-stats?userId='

var linesAlreadyRemoved = []
var fullyRead = false

const path = os.homedir() + PATH_MASTERLOG

async function getEnemyInfo() {

  const lastLine = await readLastLines.read(path, 1)

  if (lastLine.indexOf(PATTERN_LAST_LINE) >= 0) {
    return { 'playerID': '0', 'targetGod': '0' }
  }


  const rl = readLine.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity
  })
  let localPlayerId = null
  for await (const line of rl) {


    // getting id from local player
    if (localPlayerId === null && line.indexOf(PATTERN_LOCAL_PLAYERID) >= 0) {
      localPlayerId = line.substring(line.indexOf(PATTERN_LOCAL_PLAYERID) + PATTERN_LOCAL_PLAYERID.length)
    }

    if (line.indexOf(PATTERN_ENEMY_PLAYER_NAME) >= 0) {
      const enemyPlayerNameIndex = line.indexOf(PATTERN_ENEMY_PLAYER_NAME) + PATTERN_ENEMY_PLAYER_NAME.length
      const enemyName = line.substring(enemyPlayerNameIndex, line.indexOf("'", enemyPlayerNameIndex))
      PATTERN_ENEMY_CARD_PLAYED_CHANGED = PATTERN_ENEMY_CARD_PLAYED.replace('{enemyName}', enemyName) // Replacing the enemyName in our pattern
    }


    // getting enemy info
    if (line.indexOf(PATTERN_TARGETDATA) >= 0) {
      const index = line.indexOf(PATTERN_ENEMY_PLAYERID) + PATTERN_ENEMY_PLAYERID.length
      const playerID = line.substring(index, line.indexOf("'", index))
      if (playerID !== localPlayerId) {
        const targetGodIndex = line.indexOf(PATTERN_TARGETGOD) + PATTERN_TARGETGOD.length
        const targetGod = line.substring(targetGodIndex, line.indexOf("'", targetGodIndex))
        rl.close()
        return { playerID, targetGod }
      }
    }
  }
  // Game didnt start yet, cant find infos.
  return { 'playerID': '0', 'targetGod': '0' }
}

async function getDeck(enemyInfo) {
  const getChromiumExecPath = () => {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
  }
  const browser = await puppeteer.launch({ executablePath: getChromiumExecPath() })
  const page = await browser.newPage()
  await page.goto(URL_GUDECKS_PLAYERSTATS + enemyInfo.playerID, { waitUntil: 'networkidle0' })
  await page.click('.deck-results-square-shadow-' + enemyInfo.targetGod.toLowerCase() + ' a')
  await page.waitForSelector('.deck-list-item')
  let deck = []
  const cards = await page.$$('.deck-list-item')
  for (let i = 0; i < cards.length; i++) {
    const backgroundImage = await page.evaluate(el => window.getComputedStyle(el).backgroundImage, await cards[i].$('.deck-list-item-background'))
    const prot = backgroundImage.substring(backgroundImage.lastIndexOf('/') + 1, backgroundImage.lastIndexOf('.'))
    const apiResponseProto = await axios.get('https://api.godsunchained.com/v0/proto/' + prot)
    const god = apiResponseProto.data.god
    const rarity = apiResponseProto.data.rarity
    const mana = apiResponseProto.data.mana
    const name = apiResponseProto.data.name
    let countPromise = await cards[i].$('.deck-list-item-count')
    let count = '1'
    if (countPromise) {
      count = await (await countPromise.getProperty('innerText')).jsonValue()
    }
    deck = deck.concat({ 'name': name, 'mana': mana, 'count': parseInt(count.replace('x', '')), 'prot': prot, 'god': god, 'rarity': rarity })
  }
  browser.close()
  deck.pop() // Removing the last card because its a Hero Power
  deck = deck.sort((a, b) => { return a.mana > b.mana ? 1 : -1 })
  return deck

}

async function getCardsPlayed(deck) {
  const rl = readLine.createInterface({
    input: fsR(path),
    crlfDelay: Infinity
  })
  for await (const line of rl) {

    if (line.indexOf(PATTERN_LAST_LINE) >= 0) {
      return []
    }

    if (linesAlreadyRemoved.includes(line) && fullyRead) {
      rl.close()
      return deck
    }

    // Found a card playeds
    if (line.indexOf(PATTERN_ENEMY_CARD_PLAYED_CHANGED) >= 0) {
      for (var card in deck) {
        if (deck[card].name === line.substring(line.indexOf(PATTERN_ENEMY_CARD_PLAYED_CHANGED) + PATTERN_ENEMY_CARD_PLAYED_CHANGED.length) && !linesAlreadyRemoved.includes(line)) {
          linesAlreadyRemoved = linesAlreadyRemoved.concat(line)
          deck[card].count = deck[card].count - 1
          if (deck[card].count === 0) {
            deck.splice(card, 1)
          }
        }

      }
      if (line.indexOf('GameConfiguration.LoadGameConfigurationAtRuntime')) {
        fullyRead = true
      }
    }
  }

  return deck

}
async function main() {
  const enemyInfo = await getEnemyInfo()
  if (enemyInfo === null || enemyInfo.playerID === '0') {
    return []
  }
  return await getDeck(enemyInfo)

}

module.exports.main = main
module.exports.getCardsPlayed = getCardsPlayed