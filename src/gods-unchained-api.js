const axios = require('axios')

async function getLastsMatchs(playerId, god) {
    console.time('getLastsMatchs')
    function extractInfo(records) {
        for (var i = 0; i < records.length; i++) {
            const playersInfo = records[i].player_info
            for (var j = 0; j < playersInfo.length; j++) {
                if (playersInfo[j].user_id == playerId && playersInfo[j].god == god) {
                    playersInfo[j].start_time = records[i].start_time
                    console.log(playersInfo[j])
                    return playersInfo[j]
                }
            }
        }
        return null
    }
    const sort = (a, b) => { return b.start_time > a.start_time ? 1 : -1 }
    const perPage = 30
    var matches = []
    const date = new Date()
    let date10DaysAgo = new Date()
    date10DaysAgo.setHours(0, 0, 0, 0)
    date10DaysAgo.setDate(date10DaysAgo.getDate() - 10)

    await getMatches('lost')
    await getMatches('won')

    matches = matches.sort(sort)

    async function getMatches(status) {
        let page = 1
        let link
        var listMatches
        do {
            link = `https://api.godsunchained.com/v0/match?sort=start_time&order=desc&player_${status}=${playerId}&page=${page}&perPage=${perPage}&start_time=${Math.floor(date10DaysAgo / 1000)}-${Math.floor(date / 1000)}`
            console.log(link)
            listMatches = await axios.get(link)
            if (listMatches.data.records) {
                let playerInfoExtracted = extractInfo(listMatches.data.records.sort(sort))
                if(playerInfoExtracted) {
                    matches = matches.concat(playerInfoExtracted)
                }
            }
        } while ((perPage * page++) < listMatches.data.total)
    }

    console.timeEnd('getLastsMatchs')
    return matches
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

module.exports = { getFullListCards, getLastsMatchs }