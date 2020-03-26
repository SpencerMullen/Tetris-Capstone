const router    = require('express').Router()

// POST /api/logout
// Logout user
router.get('/', (req, res) => {
    res.clearCookie('auth-token')

    res.redirect('/')
})

module.exports = router