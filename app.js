const cookieParser  = require('cookie-parser')
const bodyParser    = require('body-parser')
const mongoose      = require('mongoose')
const express       = require('express')
const path          = require('path')
const cors          = require('cors')

// dotenv
require('dotenv').config()

// db config
const db = process.env.DB
mongoose
    .connect(db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then(() => console.log('Connected Successfully'))
    .catch(err => console.log('Error Connected:', err))

// server config
const port  = process.env.PORT || 8000
const app   = express()
app.use(cors());
app.use(express.static(path.join(__dirname, 'client')))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser(process.env.COOKIE))

app.use('/api/register', require('./api/register'))
app.use('/api/login', require('./api/login'))
app.use('/api/logout', require('./api/logout'))
app.use('/api/auth', require('./api/auth'))

app.get('/', (req, res) => res.redirect('/index.html'))

let s = app.listen(port, () => console.log(`App running on localhost:${port}....`))

// start websocket
require('./websockets/main')(s)

// TODO: Waiting for other player msg when player is alone in lobby | Make 3, 2, 1, Go 
// TODO: Hold Block
// TODO: Show upcoming blocks 
// TODO: Gargbage block sent to other player
// TODO: Add Ability to Change Tetris Settings
// TODO: Make rank functional