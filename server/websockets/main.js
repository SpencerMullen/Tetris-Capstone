const WebSocketServer = require('ws').Server
const Session = require('./session')
const Client = require('./client')

const server = new WebSocketServer({ port: 3000 })

const sessions = new Map

function createId(len = 6, chars = 'abcdefghjkmnopqrstvwxyz0123456789') {
    let id = ''
    while (len--) 
        id += chars[Math.random() * chars.length | 0]

    return id
}

function createClient(conn, id = createId()) {
    return new Client(conn, id)
}

function createSession(gameType, id = createId()) {
    if (sessions.has(id)) throw new Error(`Session ${id} already exists`)

    const session = new Session(id, gameType)

    sessions.set(id, session)

    return session
}

function getSession(id) {
    return sessions.get(id)
}

function broadcastSession(session) {
    const clients = [...session.clients]
    clients.forEach(client => {
        client.send({
            type: 'session-broadcast',
            started: session.started,
            peers: {
                you: client.id,
                clients: clients.map(client => ({ 
                    id: client.id,
                    state: client.state
                }))
            }
        })  
    })
}

function startSession(session) {

    const clients = [...session.clients]

    let countdown = 3

    let startInterval = setInterval(function() {
        if (countdown === 0) {
            clearInterval(startInterval)

            clients.forEach(client => 
                client.send({ 
                    type: 'session-start',
                    bag: session.bag 
                })
            )
        }

        clients.forEach(client => 
            client.send({
                type: 'session-starting',
                countdown,
                peers: {
                    you: client.id,
                    clients: clients.map(client => ({ 
                        id: client.id,
                        state: client.state
                    }))
                }
            })  
        )

        countdown--
    }, 1000)
}

function newSession(gameType, client, state) {
    const session = createSession(gameType)
    session.join(client)
    client.state = state

    client.send({
        type: 'session-created',
        id: session.id
    })
}

function joinSession(gameType, sessionId, client, state) {
    const session = getSession(sessionId)

    // if session is open, join it
    if (session && session.clients.size < 2) {
        if (session.gameType === 'ranked') {
            client.send({ type: 'ranked-join-failed' })
        } else {
            session.join(client)
            client.state = state
    
            startSession(session)
            broadcastSession(session)
        }
    } else {
        console.log('looking for session')
        // look for an open session to join
        sessions.forEach(session => {
            if (session.clients.size < 2 && session.gameType === gameType) {
                console.log('found session')

                session.join(client)
                client.state = state

                client.send({
                    type: 'session-joined',
                    id: session.id
                })

                startSession(session)
                broadcastSession(session)
            }
        })

        // if no open sessions, create one
        if (client.session === null) {
            console.log('creating session')
            newSession(gameType, client, state)
        }
    }
}

// runs whenever a client joins the server
server.on('connection', conn => {
    const client = createClient(conn) // create client

    // when the client sends a message
    conn.on('message', msg => {
        const data = JSON.parse(msg)

        // fixing error with gameType cutting off last letter
        if (data.gameType === 'ranke') data.gameType = 'ranked'
        else if (data.gameType === 'custo') data.gameType = 'custom'

        if (data.type === 'join-session') 
            joinSession(data.gameType, data.id, client, data.state)

        else if (data.type === 'state-update') {
            const [prop, value] = data.state
            client.state[data.fragment][prop] = value
            client.broadcast(data)
        }

        else if (data.type === 'get-bag') {
            const session = client.session

            // if client is within 10 pieces of the server's bag
            if (data.position >= session.bag.length - 10) {
                session.updateBag()

                client.send({
                    type: 'bag-update',
                    bag: session.bag
                })

                client.broadcast({
                    type: 'bag-update',
                    bag: session.bag
                })
            }      
        }
    })

    // when the client leaves the session
    conn.on('close', () => {
        const session = client.session
        if (session) {
            session.leave(client)
            if (session.clients.size === 0)
                sessions.delete(session.id)

            else broadcastSession(session)
        }
    })
})