class ConnectionManager {
    constructor(tetrisManager) {
        this.conn = null
        this.peers = new Map
        this.clientId = null

        this.tetrisManager = tetrisManager
        this.localTetris = [...this.tetrisManager.instances][0]
    }

    getGameType() {
        const href = window.location.href
        const urlParams = href.slice(href.indexOf('?'), href.indexOf('#')).split('=')
        if (urlParams.length === 0) window.location.href = ''
        
        return urlParams[1]
    }

    initSession() {
        const gameType = this.getGameType()
    
        const sessionId = window.location.hash.split('#')[1] || ''
        const state = this.localTetris.serialize()
        this.send({
            type: 'join-session',
            gameType: gameType,
            id: sessionId,
            state
        })
    }

    connect(address) {
        this.conn = new WebSocket(address)

        this.conn.addEventListener('open', () => {
            console.log('Connection Established')
            this.initSession() 
            this.watchEvents()
        })

        this.conn.addEventListener('message', event => {
            this.receive(event.data) 
        })
    }

    // when the player (local) emits an event, it will be received here
    watchEvents() {
        const player = this.localTetris.player;

        // for each of the following events, set up an event listener (because they follow the same format)
        ['pos', 'matrix', 'score', 'hold-piece', 'next-pieces'].forEach(prop => {
            player.events.listen(prop, value =>
                // this.send sends a message to server
                this.send({
                    type: 'state-update',
                    fragment: 'player',
                    state: [prop, value]
                })
            )
        })

        player.events.listen('ready', () => {
            this.send({ type: 'ready' })
        })

        player.events.listen('get-bag', position => 
            this.send({
                type: 'get-bag',
                position
            })
        )

        player.events.listen('send-garbage', garbage => 
            this.send({
                type: 'send-garbage',
                garbage
            })
        )

        player.events.listen('player-lost', () => {
            this.send({ type: 'player-lost' })
        })

        // send your updated arena state to server so it can be shown for the other players (who aren't you)
        const arena = this.localTetris.arena;
        ['matrix'].forEach(prop => {
            arena.events.listen(prop, value => {
                this.send({
                    type: 'state-update',
                    fragment: 'arena',
                    state: [prop, value]
                })
            })
        })
    }

    updateManager(peers) {
        const me = peers.you // get your client's id
        this.clientId = me
        const clients = peers.clients.filter(({ id }) => id !== me) // filter out your id from client ids list

        // loop through clients and add any that haven't already been added
        clients.forEach(client => {
            if (!this.peers.has(client.id)) {
                const tetris = this.tetrisManager.createPlayer()
                tetris.deserialize(client.state)
                this.peers.set(client.id, tetris)
            }
        })

        // loop through existing clients and remove any that have left
        for (const [id, tetris] of this.peers.entries()) {
            if (!clients.some(client => client.id === id)) {
                this.tetrisManager.removePlayer(tetris)
                this.peers.delete(id)
            }
        }

        const sorted = peers.clients.map(client => this.peers.get(client.id) || this.localTetris)
        this.tetrisManager.sortPlayers(sorted)
    }

    // update element of other players tetris arena
    updatePeer(id, fragment, [prop, value]) {
        if (!this.peers.has(id)) return console.error('Client does not exist')
        
        const tetris = this.peers.get(id)

        tetris[fragment][prop] = value

        if (prop === 'score') tetris.updateScore(value)
        tetris.draw(true)
    }

    receive(msg) {
        const data = JSON.parse(msg)
        // if (data.type === 'garbage-rec')
        //     console.log(`Recieved Message: `, event.data)
        
        if (data.type === 'ranked-join-failed') window.location.href = '../'
        else if (data.type === 'session-created' || data.type === 'session-joined')
            window.location.hash = data.id
        else if (data.type === 'get-ready')
            this.localTetris.getReady()
        
        else if (data.type === 'session-start') {
            this.localTetris.player.bag = data.bag
            this.localTetris.run()
        }
        else if (data.type === 'session-broadcast')
            this.updateManager(data.peers)
        else if (data.type === 'session-starting')
            this.localTetris.countdown(data.countdown)
        else if (data.type === 'state-update')
            this.updatePeer(data.clientId, data.fragment, data.state)
        else if (data.type === 'bag-update')
            this.localTetris.player.bag = data.bag
        else if (data.type === 'receive-garbage')
            this.localTetris.addGarbage(data.garbage)
        else if (data.type === 'gameOver') {
            console.log(this.clientId) // client id for future use - check if we are the winner
        }
    }

    send(data) {        
        const msg = JSON.stringify(data)

        // if (data.type !== 'state-update')
        // console.log(`Sending Message: ${msg}`)

        this.conn.send(msg)
    }
}