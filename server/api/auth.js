const router    = require('express').Router()
const User      = require('../models/User')
const jwt       = require('jsonwebtoken')

// POST /api/auth
// Authenticate JWT Token
router.post('/', async (req, res) => {
    let token = req.body.token

    if (!token) return res.status(400).send({ msg: 'No Token Provided' })

    try {
        const decoded = jwt.verify(token, process.env.JWT)
        const user = await User.findById(decoded._id).select('-password')
        
        res.send(user)
    } catch (e) {
        res.status(500).send({ error : e})
    }
})

module.exports = router