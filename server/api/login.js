const User      = require('../models/User')
const router    = require('express').Router()
const bcrypt    = require('bcryptjs')
const jwt       = require('jsonwebtoken')
const setCookie = require('../middleware/cookies')

// POST /api/login
// Login user
router.post('/', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) return res.status(400).send({ msg: 'Please Enter All Fields' })

    try {
        const user = await User.findOne({ email })

        const isMatched = await bcrypt.compare(password, user.password || '')
        if (!isMatched) return res.status(400).json({ msg: 'Email or password is incorrect.' })

        const token = await jwt.sign({ _id: user.id }, process.env.JWT, { expiresIn: 86400 })
        setCookie(res, token)

        res.redirect('/')
    } catch (e) {
        console.log(e)
        res.status(500).send({ msg: e })
    }
})

module.exports = router