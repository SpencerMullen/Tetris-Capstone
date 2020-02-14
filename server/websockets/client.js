class Client {
    constructor(conn, id) {
        this.conn = conn
        this.id = id
        this.session = null,
        
        this.state = null
    }

    broadcast(data) {
        if (!this.session) throw new Error('Cannot broadcast without a session')

        data.clientId = this.id;
        this.session.clients.forEach(client => {
            if (this === client) return
            client.send(data)
        })
    }

    send(data) {
        const msg = JSON.stringify(data)
        // console.log(`Sending Message: ${msg}`)

        this.conn.send(msg, err => {
            if (err) console.error(`Message Failed: ${msg} | ${err}`)
        })
    }
}

module.exports = Client