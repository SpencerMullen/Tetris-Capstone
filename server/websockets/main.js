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

function createSession(id = createId()) {
    if (sessions.has(id)) throw new Error(`Session ${id} already exists`)

    const session = new Session(id)
    console.log('Creating session', session)

    sessions.set(id, session)

    return session
}

function getSession(id) {
    return sessions.get(id)
}

function broadcastSession(session) {
    const clients = [...session.clients]
    clients.forEach(client => {
        console.log(client.id)
        client.send({
            type: 'session-broadcast',
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

// runs whenever a client joins the server
server.on('connection', conn => {
    const client = createClient(conn) // create client
    console.log(`-------Connection Established: ${client.id} ---------`)

    // when the client sends a message
    conn.on('message', msg => {
        const data = JSON.parse(msg)

        if (data.type === 'create-session') {
            const session = createSession()
            console.log('CREATING Session: ' + session.id)
            session.join(client)
            // console.log(session)

            client.state = data.state

            client.send({
                type: 'session-created',
                id: session.id
            })
        } else if (data.type === 'join-session') {
            const session = getSession(data.id) || createSession(data.id)
            console.log('JOINING Session: ' + session.id)
            session.join(client)

            // console.log(session)

            client.state = data.state

            broadcastSession(session)
        } else if (data.type === 'state-update') {
            const [prop, value] = data.state
            client.state[data.fragment][prop] = value
            client.broadcast(data)
        }
    })

    // when the client leaves the session
    conn.on('close', () => {
        console.log('Connection Closed')

        const session = client.session
        if (session) {
            session.leave(client)
            if (session.clients.size === 0)
                sessions.delete(session.id)

            else broadcastSession(session)
        }
    })
})