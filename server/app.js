const bodyParser    = require('body-parser')
const mongoose      = require('mongoose')
const express       = require('express')
const path          = require('path')

// dotenv
require('dotenv').config()

// start websocket
require('./websockets/main')

// db config
const db = process.env.DB
mongoose
    .connect(db, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
    .then(() => console.log('Connected Successfully'))
    .catch(err => console.log('Error Connected:', err))

// server config
const port  = process.env.PORT || 8000
const app   = express()
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use('/api/register', require('./api/register'))
app.use('/api/login', require('./api/login'))
app.get('/', (req, res) => res.redirect('/index.html'))
app.use(express.static(path.join(__dirname, '..', 'client')))

app.listen(port, () => console.log(`App running on localhost:${port}....`))

// TODO: Add Login / Auth 
// TODO: Add DB so users can save tetris settings