const User = require('../models/User')
const router = require('express').Router()

// GET /api/register
// Register user
router.post('/', async (req, res) => {
    const userInfo = { username, email, password } = req.body

    try {
        const newUser = new User(userInfo)
        await newUser.save()

        res.send(newUser)
    } catch (e) {
        res.status(500).send({ msg: e })
    }
})

module.exports = router

// TODO: check that username, email, and password fields are not empty
// TODO: check to make sure user with given email / username doesn't already exist
// TODO: add password encryption