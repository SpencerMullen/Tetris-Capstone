class ConnectionManager {
    constructor(tetrisManager) {
        this.conn = null
        this.peers = new Map

        this.tetrisManager = tetrisManager
        this.localTetris = [...this.tetrisManager.instances][0]
    }

    initSession() {
        const sessionId = window.location.hash.split('#')[1]
        const state = this.localTetris.serialize()
        if (sessionId) 
            this.send({
                type: 'join-session',
                id: sessionId,
                state
            })
        else 
            this.send({
                type: 'create-session',
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
            console.log(`Recieved Message: `, event.data)
            this.receive(event.data) 
        })
    }

    watchEvents() {
        const player = this.localTetris.player;

        ['pos', 'matrix', 'score'].forEach(prop => {
            player.events.listen(prop, value => 
                this.send({
                    type: 'state-update',
                    fragment: 'player',
                    state: [prop, value]
                })
            )
        })

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

    updatePeer(id, fragment, [prop, value]) {
        if (!this.peers.has(id)) return console.error('Client does not exit')
        
        const tetris = this.peers.get(id)

        tetris[fragment][prop] = value

        if (prop === 'score') tetris.updateScore(value)
        tetris.draw()
    }

    receive(msg) {
        const data = JSON.parse(msg)
        if (data.type === 'session-created')
            window.location.hash = data.id
        else if (data.type === 'session-broadcast')
            this.updateManager(data.peers)
        else if (data.type === 'state-update')
            this.updatePeer(data.clientId, data.fragment, data.state)
    }

    send(data) {
        const msg = JSON.stringify(data)
        console.log(`Sending Message: ${msg}`)
        this.conn.send(msg)
    }
}