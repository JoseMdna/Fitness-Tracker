const express = require('express')
const router = express.Router()
const { isAuthenticated } = require('./middleware/authenticate')


router.get('/protected', isAuthenticated, (req, res) => {
    res.send('You have accessed a protected route!')
})

module.exports = router