class Session {
    constructor(id, gameType) {
        this.id = id
        this.gameType = gameType
    
        this.clients = new Set
       
        this.bag = []

        this.updateBag()
    }

    updateBag() {
        for (let i = 0; i < 3; i++) {
            const pieces = 'ILJOTSZ'.split('');
    
            while (pieces.length > 0) {
                const piece = pieces.splice(Math.floor(Math.random() * pieces.length), 1)[0]
                this.bag.push(piece)
            }
        }   
    }

    join(client) {
        if (client.session) throw new Errror('Client already in session')
        this.clients.add(client)
        client.session = this
    }

    leave(client) {
        if (!client.session) throw new Error('Client not in session')
        this.clients.delete(client)
        client.session = null
    }

}

module.exports = Session