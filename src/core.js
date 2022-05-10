const fs = require('fs')
const os = require('os')
const readLine = require('readline')
const readLastLines = require('read-last-lines')
const fsR = require('fs-reverse')
const { getFullListCards, getLastsMatchs } = require('./gods-unchained-api')
const { dialog } = require('electron')

const PATH_LOGS = '/AppData/LocalLow/FuelGames/gods/logs/latest/'
const PATH_MASTERLOG = 'master.txt'
const PATTERN_OPPONENT_NAME = "player 1 name: '"
const PATTERN_TARGETDATA = 'TargetData:'
const PATTERN_OPPONENT_PLAYERID = "playerID:'" // dont forget the ', since its important to index
const PATTERN_TARGETGOD = "targetGod:'" // dont forget the ', since its important to index
const PATTERN_LOCAL_PLAYERID = 'Sending RegisterPlayer msg... apolloID: '
const PATTERN_FIRST_LINE = 'GameConfiguration.LoadGameConfigurationAtRuntime'
const PATTERN_LAST_LINES = ['Client handlers deregistered', 'Settings.ini successfully saved']
const PATTERN_OPPONENT_CARD_PLAYED = 'CombatRecorder: {opponentName} -> Event: Played | Card: ' // need to replace the enemyName in execution
let PATTERN_OPPONENT_CARD_PLAYED_CHANGED = ''
const END_GAME_PATTERN = { file: 'player/player_info.txt', line: 'OnEndGame()' }
var FULL_CARDS = []
var linesAlreadyRemoved = []
var fullyReaded = false
var dialogs = []


const masterLogPath = getLogPath() + PATH_LOGS + PATH_MASTERLOG
const playerInfoLogPath = getLogPath() + PATH_LOGS + END_GAME_PATTERN.file

function getLogPath() {
    if (os.platform() === 'win32') {
        return os.homedir()
    }
}

function verifyPathLogs(debug) {
    debug('message', 'verifyPathLogs')
    if (!fs.existsSync(masterLogPath)) {
        console.log('Cant find the log in path log: ' + masterLogPath)
        debug('message', `Can't find the master log on ${masterLogPath}.`)
        return false
    }

    if (!fs.existsSync(playerInfoLogPath)) {
        console.log('Cant find the log in path log: ' + playerInfoLogPath)
        debug('message', `Can't find the master log on ${playerInfoLogPath}.`)
        return false
    }

    return true
}

// Verify with two methods if the game is over, since the logs sometimes changes, needs to keep this two ways.
async function verifyGameOver(debug) {
    debug('message', 'verifyGameOver')

    let lastLine = await readLastLines.read(masterLogPath, 1)
    debug('message', `lastLine: ${lastLine} from ${masterLogPath}`)
    if (lastLine.indexOf(PATTERN_LAST_LINES[0]) >= 0 || lastLine.indexOf(PATTERN_LAST_LINES[1]) >= 0) {
        return true
    }

    lastLine = await readLastLines.read(playerInfoLogPath, 1)
    debug('message', `lastLine: ${lastLine} from ${playerInfoLogPath}`)
    return lastLine.indexOf(END_GAME_PATTERN.line) >= 0
}

export async function getOpponentInfo(debug) {

    if (!debug) {
        debug = () => { }
    }

    debug('message', 'getOpponentInfo')

    if (!verifyPathLogs(debug)) {
        return { 'id': '0', 'god': '0' }
    }

    if (await verifyGameOver(debug)) {
        debug('message', 'Waiting game start...')
        return { 'id': '0', 'god': '0' }
    }

    const rl = readLine.createInterface({
        input: fs.createReadStream(masterLogPath),
        crlfDelay: Infinity
    })
    let localPlayerId = null
    for await (const line of rl) {

        // getting id from local player
        if (localPlayerId === null && line.indexOf(PATTERN_LOCAL_PLAYERID) >= 0) {
            localPlayerId = line.substring(line.indexOf(PATTERN_LOCAL_PLAYERID) + PATTERN_LOCAL_PLAYERID.length)
            debug('message', 'Your player ID: ' + localPlayerId)
        }

        if (line.indexOf(PATTERN_OPPONENT_NAME) >= 0) {
            const opponentNameIndex = line.indexOf(PATTERN_OPPONENT_NAME) + PATTERN_OPPONENT_NAME.length
            const opponentNickname = line.substring(opponentNameIndex, line.indexOf("'", opponentNameIndex))
            PATTERN_OPPONENT_CARD_PLAYED_CHANGED = PATTERN_OPPONENT_CARD_PLAYED.replace('{opponentName}', opponentNickname) // Replacing the opponentName in our pattern
            debug('message', 'Opponent nickname: ' + opponentNickname)
        }

        // getting enemy info
        if (line.indexOf(PATTERN_TARGETDATA) >= 0) {
            const index = line.indexOf(PATTERN_OPPONENT_PLAYERID) + PATTERN_OPPONENT_PLAYERID.length
            const opponentId = line.substring(index, line.indexOf("'", index))
            if (opponentId !== localPlayerId) {
                const targetGodIndex = line.indexOf(PATTERN_TARGETGOD) + PATTERN_TARGETGOD.length
                const opponentGod = line.substring(targetGodIndex, line.indexOf("'", targetGodIndex))
                debug('message', 'Opponent ID: ' + opponentId)
                debug('message', 'Opponent God: ' + opponentGod)
                rl.close()
                return { 'id': opponentId, 'god': opponentGod.toLowerCase() }
            }
        }
    }
    rl.close()
    // Game didnt start yet, cant find infos.
    return { 'id': '0', 'god': '0' }
}

var zaz = 0
export async function getInitialDeck(opponentInfo, debug) {

    if (!debug) {
        debug = () => { }
    }

    if (FULL_CARDS.length === 0) {
        debug('mensagem', 'Getting card list from API.')
        FULL_CARDS = await getFullListCards()
        if(!FULL_CARDS || FULL_CARDS.length == 0) {
            debug('message', 'Cant get the list of cards from API, maybe the server is in maintance.')
            return []
        }
    }
    const matchs = await getLastsMatchs(opponentInfo.id, opponentInfo.god)
    if (matchs.length == 0) {
        debug('mensagem', 'Cant get lasts matchs from this opponent')
        console.log('Cant get lasts matchs from this opponent')
        if (!dialogs[opponentInfo.id]) {
            dialog.showMessageBox(null, {title: 'GU Tracker' ,message: `There aren't any games from this player ${opponentInfo.id} with god ${opponentInfo.god} in lasts 10 days.`})
            dialogs[opponentInfo.id] = true
        }
        return []
    }
    const cards = matchs[0].cards

    var deck = []
    let cardsCount = 0
    for (var i = 0; i < FULL_CARDS.length; i++) {
        if (FULL_CARDS[i].god !== 'neutral' && FULL_CARDS[i].god !== opponentInfo.god.toLowerCase()) {
            continue
        }

        cardsLabel: for (var z = 0; z < cards.length; z++) {
            if (FULL_CARDS[i].id === cards[z]) {
                for (var j = 0; j < deck.length; j++) {
                    if (deck[j].prot === FULL_CARDS[i].id) {
                        deck[j].count = deck[j].count + 1
                        cardsCount++
                        continue cardsLabel
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
            break
        }
    }
    deck = deck.sort((a, b) => { return a.mana > b.mana ? 1 : -1 })
    return deck

}

export async function removeCardsPlayed(deck, debug) {

    if (!debug) {
        debug = () => { }
    }

    if (await verifyGameOver(debug)) {
        debug('message', 'Game over.')
        return []
    }

    const rl = readLine.createInterface({
        input: fsR(masterLogPath),
        crlfDelay: Infinity
    })
    for await (const line of rl) {

        // Old version used this patter, I gonna keep it if they back into it.
        if (line.indexOf(PATTERN_LAST_LINES[0]) >= 0 || line.indexOf(PATTERN_LAST_LINES[1]) >= 0) {
            debug('message', 'Game Over - Old version.')
            rl.close()
            return []
        }

        if (linesAlreadyRemoved.includes(line) && fullyReaded) {
            rl.close()
            debug('mensagem', 'Already read the entire log.')
            return deck
        }

        // Found a card played
        if (line.indexOf(PATTERN_OPPONENT_CARD_PLAYED_CHANGED) >= 0) {
            for (var i in deck) {
                if (deck[i].name === line.substring(line.indexOf(PATTERN_OPPONENT_CARD_PLAYED_CHANGED) + PATTERN_OPPONENT_CARD_PLAYED_CHANGED.length) && !linesAlreadyRemoved.includes(line)) {
                    linesAlreadyRemoved = linesAlreadyRemoved.concat(line)
                    deck[i].count = deck[i].count - 1
                    debug('mensagem', `Card played: ${deck[i].name}. New count left: ${deck[i].count}`)
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

    rl.close()
    return deck

}

export async function getDeck(debug) {
    if (!debug) {
        debug = () => { }
    }
    const opponentInfo = await getOpponentInfo()
    if (opponentInfo === null || opponentInfo.id === '0') {
        debug('mensagem', `getDeck - No opponentInfo found. opponentInfo: ${opponentInfo}`)
        return []
    }
    return await getInitialDeck(opponentInfo, debug)
}

// function decodeDeck(deckCode) {
//     const codes = deckCode.split('_')
//     const GU = codes[0]
//     const version = codes[1]
//     const god = codes[2]
//     const cards = codes[3]
//     var result = []
//     for (var i = 0; i < cards.length; i = i + 3) {
//         result[result.length] = 'L' + b52todec(cards.substring(i, i + 1)) + '-' + fillWithZero(b52todec(cards.substring(i + 1, i + 3)))
//     }
//     return result
// }

// function b52todec(value) {
//     const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
//     const numbers = '0123456789'
//     var valueSize = value.length
//     var alphabetIndex = {}
//     const alphabetSize = alphabet.length
//     const numbersSize = numbers.length
//     var g = "string" == typeof H ? "" : []
//     for (var i = 0; i < valueSize; i++) {
//         alphabetIndex[i] = alphabet.indexOf(value[i])
//     }

//     do {
//         for (var j = 0, N = 0, B = 0; B < valueSize; B++) {
//             j = j * alphabetSize + alphabetIndex[B]
//             if (j >= numbersSize) {
//                 alphabetIndex[N++] = parseInt(j / numbersSize, 10)
//                 j %= numbersSize
//             } else {
//                 N > 0 && (value[N++] = 0)
//             }
//         }
//         valueSize = N
//         g = numbers.slice(j, j + 1).concat(g)
//     } while (0 !== N);
//     return g
// }
// function fillWithZero(x) {
//     const size = 3 - x.length
//     for (let i = 0; i < size; i++) {
//         x = '0' + x
//     }
//     return x
// }