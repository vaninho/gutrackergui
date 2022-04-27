const fs = require('fs')
const os = require('os')
const readLine = require('readline')
const readLastLines = require('read-last-lines')
const axios = require('axios')
const puppeteer = require('puppeteer')
const fsR = require('fs-reverse')

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

    if (lastLine.indexOf(PATTERN_LAST_LINES[0]) >= 0 || lastLine.indexOf(PATTERN_LAST_LINES[1]) >= 0) {
        console.log('Game already over.')
        return { 'id': '0', 'god': '0' }
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

        if (line.indexOf(PATTERN_OPPONENT_NAME) >= 0) {
            const opponentNameIndex = line.indexOf(PATTERN_OPPONENT_NAME) + PATTERN_OPPONENT_NAME.length
            const opponentNickname = line.substring(opponentNameIndex, line.indexOf("'", opponentNameIndex))
            PATTERN_OPPONENT_CARD_PLAYED_CHANGED = PATTERN_OPPONENT_CARD_PLAYED.replace('{opponentName}', opponentNickname) // Replacing the enemyName in our pattern
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

var zaz = 0
export async function getInitialDeck(opponentInfo) {
    if (FULL_CARDS.length === 0) {
        FULL_CARDS = await getFullListCards()
    }
    console.log('getInitialDeck opponentInfo'+opponentInfo.id)
    const browser = await puppeteer.launch(puppeteer.executablePath())
    const page = await browser.newPage()
    await page.goto(URL_GUDECKS_PLAYERSTATS + opponentInfo.id, { waitUntil: 'networkidle0' })
    let link = await page.evaluate(a => a.getAttribute('href'), await page.$('.deck-results-square-shadow-' + opponentInfo.god.toLowerCase() + ' a'))
    console.log('link '+link)
    // test
    // let link = '/decks/GU_1_4_KAaKAaKAbKAmKAnKAnCANCANCAmCAmCAnCCJCEHCEkCEkCEmCEqCErCErCFpCFpHBPIBCIBeIBgIBiIBiIBmIBsICO?godPowers=100127&creator=UkF&userId=1206296&archetype=Card Draw Magic'
    browser.close()
    link = link.replace('/decks/', '')
    const deckCode = link.substring(0, link.indexOf('?'))
    const decodedDeck = decodeDeck(deckCode)
    var deck = []
    let cardsCount = 0
    for (var i = 0; i < FULL_CARDS.length; i++) {
        if (FULL_CARDS[i].god !== 'neutral' && FULL_CARDS[i].god !== opponentInfo.god.toLowerCase()) {
            continue
        }
        decodedDeckLabel: for (var z = 0; z < decodedDeck.length; z++) {
            if (FULL_CARDS[i].lib_id === decodedDeck[z]) {
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
            zaz = zaz +1
            console.log(zaz)
            break
        }
    }
    deck = deck.sort((a, b) => { return a.mana > b.mana ? 1 : -1 })
    return deck

}

export async function removeCardsPlayed(deck) {
    console.log(PATTERN_OPPONENT_CARD_PLAYED_CHANGED)
    const rl = readLine.createInterface({
        input: fsR(path),
        crlfDelay: Infinity
    })
    for await (const line of rl) {

        if (line.indexOf(PATTERN_LAST_LINES[0]) >= 0 || line.indexOf(PATTERN_LAST_LINES[1]) >= 0) {
            rl.close()
            return []
        }

        if (linesAlreadyRemoved.includes(line) && fullyReaded) {
            console.log('leu tudo, retorna o deck como esta')
            rl.close()
            return deck
        }

        // Found a card played
        if (line.indexOf(PATTERN_OPPONENT_CARD_PLAYED_CHANGED) >= 0) {
            for (var i in deck) {
                if (deck[i].name === line.substring(line.indexOf(PATTERN_OPPONENT_CARD_PLAYED_CHANGED) + PATTERN_OPPONENT_CARD_PLAYED_CHANGED.length) && !linesAlreadyRemoved.includes(line)) {
                    linesAlreadyRemoved = linesAlreadyRemoved.concat(line)
                    deck[i].count = deck[i].count - 1
                    if (deck[i].count === 0) {
                        deck.splice(i, 1)
                    }
                }
            }
            if (line.indexOf(PATTERN_FIRST_LINE)) {
                fullyReaded = true
            }
        }
    }

    console.log(linesAlreadyRemoved)
    rl.close()
    return deck

}

export async function getDeck() {
    const opponentInfo = await getOpponentInfo()
    if (opponentInfo === null || opponentInfo.id === '0') {
        return []
    }
    return await getInitialDeck(opponentInfo)
}

async function getFullListCards() {
    console.time('getFullCards')
    var cards = []
    const listProto = await axios.get('https://api.godsunchained.com/v0/proto?perPage=9999')
    if (listProto && listProto.length < 1) {
        console.log('Cant access Gods Unchained API')
        // FAZER MENSAGEM APARECER NO MAIN
    }
    listProto.data.records.forEach(proto => {
        cards = cards.concat({
            'id': proto.id, 'god': proto.god, 'rarity': proto.rarity,
            'mana': proto.mana, 'name': proto.name, 'lib_id': proto.lib_id
        })
    });
    console.timeEnd('getFullCards')
    return cards
}

function decodeDeck(deckCode) {
    const codes = deckCode.split('_')
    const GU = codes[0]
    const version = codes[1]
    const god = codes[2]
    const cards = codes[3]
    var result = []
    for (var i = 0; i < cards.length; i = i + 3) {
        result[result.length] = 'L' + b52todec(cards.substring(i, i + 1)) + '-' + fillWithZero(b52todec(cards.substring(i + 1, i + 3)))
    }
    return result
}

function b52todec(value) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    var valueSize = value.length
    var alphabetIndex = {}
    const alphabetSize = alphabet.length
    const numbersSize = numbers.length
    var g = "string" == typeof H ? "" : []
    for (var i = 0; i < valueSize; i++) {
        alphabetIndex[i] = alphabet.indexOf(value[i])
    }

    do {
        for (var j = 0, N = 0, B = 0; B < valueSize; B++) {
            j = j * alphabetSize + alphabetIndex[B]
            if (j >= numbersSize) {
                alphabetIndex[N++] = parseInt(j / numbersSize, 10)
                j %= numbersSize
            } else {
                N > 0 && (value[N++] = 0)
            }
        }
        valueSize = N
        g = numbers.slice(j, j + 1).concat(g)
    } while (0 !== N);
    return g
}
function fillWithZero(x) {
    const size = 3 - x.length
    for (let i = 0; i < size; i++) {
        x = '0' + x
    }
    return x
}
export function openDonatePage() {
    require('electron').shell.openExternal('https://www.paypal.com/donate/?hosted_button_id=KMYN4WU5L8FJ8')
}