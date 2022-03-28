const fs = require('fs')
const os = require('os')
const readLine = require('readline')
const puppeteer = require('puppeteer')
const fsR = require('fs-reverse')
const readLastLines = require('read-last-lines');
const chromium = require('chromium')

const PATH_FUELGAMES = '/AppData/LocalLow/FuelGames/'
const PATH_MASTERLOG = '/logs/latest/master.txt'
const PATTERN_ENEMY_PLAYER_NAME = "player 1 name: '"
const PATTERN_TARGETDATA = 'TargetData:'
const PATTERN_ENEMY_PLAYERID = "playerID:'" // dont forget the ', since its important to index
const PATTERN_TARGETGOD = "targetGod:'" // dont forget the ', since its important to index
const PATTERN_LOCAL_PLAYERID = 'Sending RegisterPlayer msg... apolloID: '
const PATTERN_LAST_LINE = 'Settings.ini successfully saved'
let PATTERN_ENEMY_CARD_PLAYED = 'CombatRecorder: {enemyName} -> Event: Played | Card: ' // need to replace the enemyName in execution
const URL_GUDECKS_PLAYERSTATS = 'https://gudecks.com/meta/player-stats?userId='

var linesAlreadyRemoved = []
var fullyRead = false

// Changed the path, now its only 'gods' folder
const path = os.homedir() + PATH_FUELGAMES + 'gods' + PATH_MASTERLOG
// const files = fs.readdirSync(path)
// path = path + (files[files.length - 1] + '') + PATH_MASTERLOG


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
      console.log('ENTROU')
      const enemyPlayerNameIndex = line.indexOf(PATTERN_ENEMY_PLAYER_NAME) + PATTERN_ENEMY_PLAYER_NAME.length
      const enemyName = line.substring(enemyPlayerNameIndex, line.indexOf("'", enemyPlayerNameIndex))
      PATTERN_ENEMY_CARD_PLAYED = PATTERN_ENEMY_CARD_PLAYED.replace('{enemyName}', enemyName) // Replacing the enemyName in our pattern
      console.log(PATTERN_ENEMY_CARD_PLAYED)
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
}

async function getDeck(enemyInfo) {
  const getChromiumExecPath = () => {
    return puppeteer.executablePath().replace('app.asar', 'app.asar.unpacked');
  }
  const browser = await puppeteer.launch({ executablePath: getChromiumExecPath() })
  const page = await browser.newPage()
  console.log(URL_GUDECKS_PLAYERSTATS + enemyInfo.playerID)
  await page.goto(URL_GUDECKS_PLAYERSTATS + enemyInfo.playerID, { waitUntil: 'networkidle0' })
  await page.click('.deck-results-square-shadow-' + enemyInfo.targetGod.toLowerCase() + ' a')
  await page.waitForSelector('.deck-list-item')
  let deck = []
  const cards = await page.$$('.deck-list-item')
  for (let i = 0; i < cards.length; i++) {
    const mana = await cards[i].$eval('.deck-list-item-mana', e => e.innerText)
    const name = await cards[i].$eval("[class='deck-list-item-name']", e => e.innerText)
    let countPromise = await cards[i].$('.deck-list-item-count')
    let count = '1'
    if (countPromise) {
      count = await (await countPromise.getProperty('innerText')).jsonValue()
    }
    deck = deck.concat({ 'name': name, 'mana': mana, 'count': parseInt(count.replace('x', '')) })
  }
  browser.close()
  deck.pop() // Removing the last card because its a Hero Power
  return deck

}

async function getCardsPlayed(deck) {
  const rl = readLine.createInterface({
    input: fsR(path),
    crlfDelay: Infinity
  })
  console.log('getCardsPlayed ' + PATTERN_ENEMY_CARD_PLAYED)
  for await (const line of rl) {

    if (line.indexOf(PATTERN_LAST_LINE) >= 0) {
      return []
    }

    if (linesAlreadyRemoved.includes(line) && fullyRead) {
      rl.close()
      return deck
    }

    // Found a card played
    if (line.indexOf(PATTERN_ENEMY_CARD_PLAYED) >= 0) {
      for (var card in deck) {
        if (deck[card].name === line.substring(line.indexOf(PATTERN_ENEMY_CARD_PLAYED) + PATTERN_ENEMY_CARD_PLAYED.length) && !linesAlreadyRemoved.includes(line)) {
          console.log('removendo count carta: ' + deck[card].name)
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
  const deck = await getDeck(enemyInfo)
  // generic deck, used to not getting always from remote when testing.
  // TODO: treat the hero power since its comming as a card.

  // Its all only for fast tests
  // const enemyName = 'psilo'
  // PATTERN_CARD_PLAYED = PATTERN_CARD_PLAYED.replace('{enemyName}', enemyName)
  // const deck = [
  //   { name: 'Battlebard', mana: '1', count: '2' },
  //   { name: 'Trial Spirit', mana: '1', count: '1' },
  //   { name: 'Vicious Rend', mana: '1', count: '2' },
  //   { name: 'Enduring Shield', mana: '2', count: '1' },
  //   { name: 'Master Tactician', mana: '2', count: '1' },
  //   { name: 'Sharpen', mana: '2', count: '2' },
  //   { name: 'Tavern Brawler', mana: '2', count: '2' },
  //   { name: "Valka's Captain", mana: '2', count: '2' },
  //   { name: 'Viking Warmaiden', mana: '2', count: '2' },
  //   { name: 'Blade of Styx', mana: '3', count: '2' },
  //   { name: 'Bloodguard', mana: '3', count: '2' },
  //   { name: 'Deathsworn Raider', mana: '3', count: '1' },
  //   { name: "Oddi, Valka's Herald", mana: '3', count: '1' },
  //   { name: 'Raid Reveller', mana: '3', count: '1' },
  //   { name: 'Another Round!', mana: '4', count: '1' },
  //   { name: 'Viking Longship', mana: '4', count: '1' },
  //   { name: 'Redfume Serum', mana: '5', count: '1' },
  //   { name: 'Leviathan Hunter', mana: '1', count: '2' },
  //   { name: 'Vanguard Axewoman', mana: '1', count: '2' },
  //   { name: 'Iron-tooth Goblin', mana: '2', count: '1' },
  //   { name: 'Slayer', mana: '2', count: '1' }
  // ]
  // deck.pop() // removing the last card because it is a Hero Power

  return deck
}

module.exports.main = main
module.exports.getCardsPlayed = getCardsPlayed