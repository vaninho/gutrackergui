const fs = require('fs')
const os = require('os')
const readLine = require('readline')
const readLastLines = require('read-last-lines')
const axios = require('axios')
const puppeteer = require('puppeteer-in-electron')

const PATH_MASTERLOG = '/AppData/LocalLow/FuelGames/gods/logs/latest/master.txt'
const PATTERN_OPPONENT_NAME = "player 1 name: '"
const PATTERN_TARGETDATA = 'TargetData:'
const PATTERN_OPPONENT_PLAYERID = "playerID:'" // dont forget the ', since its important to index
const PATTERN_TARGETGOD = "targetGod:'" // dont forget the ', since its important to index
const PATTERN_LOCAL_PLAYERID = 'Sending RegisterPlayer msg... apolloID: '
const PATTERN_FIRST_LINE = 'GameConfiguration.LoadGameConfigurationAtRuntime'
const PATTERN_LAST_LINES = ['Client handlers deregistered', 'Settings.ini successfully saved']
const PATTERN_OPPONENT_CARD_PLAYED = 'CombatRecorder: {opponentName} -> Event: Played | Card: ' // need to replace the enemyName in execution
let PATTERN_OPPONENT_CARD_PLAYED_CHANGED = ''
const URL_GUDECKS_PLAYERSTATS = 'https://gudecks.com/meta/player-stats?userId='
var FULL_CARDS = []

var linesAlreadyRemoved = []
var fullyReaded = false

const path = getLogPath() + PATH_MASTERLOG

if (!fs.existsSync(path)) {
    console.log('Cant find the log in path log: ' + path)
}

function getLogPath() {
    if (os.platform() === 'win32') {
        return os.homedir()
    }
}

export async function getOpponentInfo() {
    const lastLine = await readLastLines.read(path, 1)

    // if (lastLine.indexOf(PATTERN_LAST_LINES[0]) >= 0 || lastLine.indexOf(PATTERN_LAST_LINES[1]) >= 0) {
    //     console.log('Game already over.')
    //     return { 'id': '0', 'god': '0' }
    // }

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

        if (line.indexOf(PATTERN_OPPONENT_NAME) >= 0) {
            const enemyPlayerNameIndex = line.indexOf(PATTERN_OPPONENT_NAME) + PATTERN_OPPONENT_NAME.length
            const enemyName = line.substring(enemyPlayerNameIndex, line.indexOf("'", enemyPlayerNameIndex))
            PATTERN_OPPONENT_CARD_PLAYED_CHANGED = PATTERN_OPPONENT_CARD_PLAYED.replace('{opponentName}', enemyName) // Replacing the enemyName in our pattern
        }

        // getting enemy info
        if (line.indexOf(PATTERN_TARGETDATA) >= 0) {
            const index = line.indexOf(PATTERN_OPPONENT_PLAYERID) + PATTERN_OPPONENT_PLAYERID.length
            const opponentId = line.substring(index, line.indexOf("'", index))
            if (opponentId !== localPlayerId) {
                const targetGodIndex = line.indexOf(PATTERN_TARGETGOD) + PATTERN_TARGETGOD.length
                const opponentGod = line.substring(targetGodIndex, line.indexOf("'", targetGodIndex))
                rl.close()
                return { 'id': opponentId, 'god': opponentGod }
            }
        }
    }
    rl.close()
    // Game didnt start yet, cant find infos.
    return { 'id': '0', 'god': '0' }
}

export async function getInitialDeck(enemyInfo) {
    if (FULL_CARDS.length === 0) {
        FULL_CARDS = await getFullListCards()
    }
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(URL_GUDECKS_PLAYERSTATS + enemyInfo.id, { waitUntil: 'networkidle0' })
    let link = await page.evaluate(a => a.getAttribute('href'), await page.$('.deck-results-square-shadow-' + enemyInfo.god.toLowerCase() + ' a'))
    console.log(link)
    browser.close()
    console.timeEnd('puppeter')
    link = link.replace('/decks/', '')
    const deckCode = link.substring(0, link.indexOf('?'))
    console.time('decodeDeck')
    const decodedDeck = decodeDeck(deckCode)
    console.timeEnd('decodeDeck')
    var deck = []
    let cardsCount = 0
    console.time('matchingcards')
    for (var i = 0; i < FULL_CARDS.length; i++) {
        if (FULL_CARDS[i].god !== 'neutral' && FULL_CARDS[i].god !== enemyInfo.god.toLowerCase()) {
            continue
        }
        decodedDeckLabel: for (var z = 0; z < decodedDeck.length; z++) {
            if (FULL_CARDS[i].lib_id === decodedDeck[z]) {
                console.log('INDEX: ' + i + ' - id: ' + FULL_CARDS[i].id + ' - ' + FULL_CARDS[i].name + ' -lib_id ' + FULL_CARDS[i].lib_id)
                for (var j = 0; j < deck.length; j++) {
                    if (deck[j].prot === FULL_CARDS[i].id) {
                        deck[j].count = deck[j].count + 1
                        cardsCount++
                        continue decodedDeckLabel
                    }
                }
                deck = deck.concat({
                    'prot': FULL_CARDS[i].id, 'god': FULL_CARDS[i].god, 'rarity': FULL_CARDS[i].rarity,
                    'mana': FULL_CARDS[i].mana, 'name': FULL_CARDS[i].name, 'count': 1
                })
                cardsCount++
            }
        }
        if (cardsCount >= 30) {
            console.log('Chegamos a count 30')
            break
        }
    }
    console.timeEnd('matchingcards')
    deck = deck.sort((a, b) => { return a.mana > b.mana ? 1 : -1 })
    return deck

}

async function getFullListCards() {
    console.time('getFullCards')
    var cards = []
    const listProto = await axios.get('https://api.godsunchained.com/v0/proto?perPage=9999')
    listProto.data.records.forEach(proto => {
        cards = cards.concat({
            'id': proto.id, 'god': proto.god, 'rarity': proto.rarity,
            'mana': proto.mana, 'name': proto.name, 'lib_id': proto.lib_id
        })
    });
    console.timeEnd('getFullCards')
    return cards
}

export function openDonatePage() {
    require('electron').shell.openExternal('https://www.paypal.com/donate/?hosted_button_id=KMYN4WU5L8FJ8')
}