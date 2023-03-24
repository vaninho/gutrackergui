const fs = require('fs')
const os = require('os')
const readLine = require('readline')
const readLastLines = require('read-last-lines')
const fsR = require('fs-reverse')
const { getFullListCards, getLastsMatchs } = require('./gods-unchained-api')
const { dialog } = require('electron')

const PATH_LOGS = '/AppData/LocalLow/Immutable/gods/'
const DEBUG_FILE_NAME = 'debug.log'
const COMBAT_FILE_NAME = 'combat.log'
const PATTERN_OPPONENT_APOLLO_ID = " o:PlayerInfo(apolloId: "
const PATTERN_OPPONENT_GOD = 'Log]: Set God Color: '
const PATTERN_OPPONENT_NICKNAME = 'nickName:'
const PATTERN_FIRST_LINE = 'GameConfiguration.LoadGameConfigurationAtRuntime'
const PATTERN_END_GAME = '---The Game Has Ended---'
const PATTERN_OPPONENT_CARD_PLAYED = '| CombatRecorder | {opponentNickName} | Event: Played | Card: ' // need to replace the enemyName in execution
let PATTERN_OPPONENT_CARD_PLAYED_CHANGED = ''
var FULL_CARDS = []
var linesAlreadyRemoved = []
var fullyReaded = false
var dialogs = []


const debugLog = getLogPath() + PATH_LOGS + DEBUG_FILE_NAME
const combatLog = getLogPath() + PATH_LOGS + END_GAME_PATTERN.file

function getLogPath() {
    if (os.platform() === 'win32') {
        return os.homedir()
    }
}

function verifyPathLogs(debug) {
    debug('message', 'verifyPathLogs')
    if (!fs.existsSync(debugLog)) {
        console.log('Cant find the log in path log: ' + debugLog)
        debug('message', `Can't find the master log on ${debugLog}.`)
        return false
    }

    if (!fs.existsSync(combatLog)) {
        console.log('Cant find the log in path log: ' + combatLog)
        debug('message', `Can't find the master log on ${combatLog}.`)
        return false
    }

    return true
}

export async function getOpponentInfo(debug) {

    if (!debug) {
        debug = () => { }
    }

    debug('message', 'getOpponentInfo')

    if (!verifyPathLogs(debug)) {
        return { 'id': '0', 'opponentGod': '0' }
    }

    // TODO: Verificar se o game já não acabou.!!

    const rl = readLine.createInterface({
        input: fs.createReadStream(debugLog),
        crlfDelay: Infinity
    })

    let opponentApolloId = '0', opponentGod = '0'
    let godCounter = 0
    for await (const line of rl) {

        if(opponentApolloId !== '0' && opponentGod !== '0') {
            rl.close()
            return { 'id': opponentApolloId, 'opponentGod': opponentGod }
        }

        if (line.indexOf(PATTERN_OPPONENT_APOLLO_ID) >= 0) {
            const opponentApolloIdIndex = line.indexOf(PATTERN_OPPONENT_APOLLO_ID) + PATTERN_OPPONENT_APOLLO_ID.length
            opponentApolloId = line.substring(opponentApolloIdIndex, line.indexOf(",", opponentApolloIdIndex))
            const opponentNicknameIndex = line.indexOf('nickname', opponentApolloIdIndex) + PATTERN_OPPONENT_NICKNAME.length
            opponentNickname = line.substring(opponentNicknameIndex, line.indexOf(',', opponentNicknameIndex))
            PATTERN_OPPONENT_CARD_PLAYED_CHANGED = PATTERN_OPPONENT_CARD_PLAYED.replace('{opponentNickName}', opponentNickname) // Replacing the opponentName in our pattern
            debug('message', 'Opponent nickname: ' + opponentNickname)
        }

        if(line.indexOf(PATTERN_OPPONENT_GOD) >= 0) {
            godCounter++
            if(godCounter === 2) {
                opponentGod = line.substring(line.indexOf(PATTERN_OPPONENT_GOD)+PATTERN_OPPONENT_GOD.length).toLowerCase()
            }
        }
    }
    rl.close()
    return { 'id': opponentApolloId, 'opponentGod': opponentGod }
}

export async function getInitialDeck(opponentInfo, debug) {

    if (!debug) {
        debug = () => { }
    }

    if (FULL_CARDS.length === 0) {
        debug('mensagem', 'Getting card list from API.')
        FULL_CARDS = await getFullListCards(debug)
        if (!FULL_CARDS || FULL_CARDS.length == 0) {
            return []
        }
    }
    const matchs = await getLastsMatchs(opponentInfo.id, opponentInfo.god)
    if (matchs.length == 0) {
        debug('mensagem', 'Cant get lasts matchs from this opponent')
        console.log('Cant get lasts matchs from this opponent')
        if (!dialogs[opponentInfo.id]) {
            dialog.showMessageBox(null, { title: 'GU Tracker', message: `There aren't any games from this player ${opponentInfo.id} with god ${opponentInfo.god} in lasts 10 days.` })
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

    // TODO: VERIFY IF THE GAME IS OVER

    const rl = readLine.createInterface({
        input: fsR(debugLog),
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
    const opponentInfo = await getOpponentInfo(debug)
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