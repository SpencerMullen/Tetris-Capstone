const User = require('../models/User')
const router = require('express').Router()

// POST /api/login
// Login user
router.post('/', async (req, res) => {
    const userInfo = { email, password } = req.body

    try {
        const user = await User.findOne(userInfo)
        
        if (!user) return res.send({ msg: 'Error Logging In' })
        res.send(user)
    } catch (e) {
        res.status(500).send({ msg: e })
    }
})

module.exports = router

// TODO: check that email, and password fields are not empty