const User      = require('../models/User')
const router    = require('express').Router()
const bcrypt    = require('bcryptjs')
const jwt       = require('jsonwebtoken')
const setCookie = require('../middleware/cookies')

// GET /api/register
// Register user
router.post('/', async (req, res) => {
    const userInfo = { username, email, password } = req.body

    if (!username || !email || !password) return res.status(400).send({ msg: 'Please Enter All Fields' })

    try {

        const user_email = await User.findOne({ email })
        const user_username = await User.findOne({ username })

        if (user_email) return res.status(400).send({ msg: 'Email already taken' })
        if (user_username) return res.status(400).send({ msg: 'Username already taken' })

        const newUser = new User(userInfo)

        // Create password hash
        const salt = await bcrypt.genSalt()
        const hash = await bcrypt.hash(password, salt)

        newUser.password = hash

        await newUser.save()

        const token = await jwt.sign({ _id: newUser.id }, process.env.JWT, { expiresIn: 86400 })
        setCookie(res, token)
        
        res.redirect('/')
    } catch (e) {
        console.log(e)
        res.status(500).send({ msg: e })
    }
})

module.exports = router