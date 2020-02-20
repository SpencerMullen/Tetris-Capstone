const express       = require('express')
const path          = require('path')

// start websocket
require('./websockets/main')

const port  = process.env.PORT || 8000
const app   = express()

app.get('/', (req, res) => res.redirect('/index.html'))
app.use(express.static(path.join(__dirname, '..', 'client')))

app.listen(port, () => console.log(`App running on localhost:${port}....`))

// TODO: Add Login / Auth 
// TODO: Add DB so users can save tetris settings