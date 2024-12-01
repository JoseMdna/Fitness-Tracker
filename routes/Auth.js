const express = require('express')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const router = express.Router()

function isAuthenticated(req, res, next) {
    if (req.session.userId || req.session.isGuest) {
        return next()
    }
    res.redirect('/login')
}


function restrictGuests(req, res, next) {
    if (req.session.isGuest) {
        return res.redirect('/register')
    }
    next()
}


router.get('/register', (req, res) => {
    res.render('register.ejs', { error: null })
  })

router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body
      const hashedPassword = await bcrypt.hash(password, 10)
      await User.create({ email, password: hashedPassword })
      res.redirect('/login')
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.email) {
        return res.render('register.ejs', { error: 'This email is already registered.' })
      }
      res.status(500).render('register.ejs', { error: 'An unexpected error occurred. Please try again.' })
    }
  })
  
  

  router.get('/login', (req, res) => {
    res.render('login.ejs', { error: null })
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id
            res.redirect('/activities')
        } else {
            res.status(400).render('login.ejs', { error: 'Invalid email or password' })
        }
    } catch (error) {
        res.status(500).render('login.ejs', { error: 'An unexpected error occurred. Please try again.' })
    }
})



router.post('/guest', (req, res) => {
    req.session.isGuest = true;
    res.redirect('/activities')
  })
  

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error during logout')
        }
        res.redirect('/login')
    })
})


module.exports = { router, isAuthenticated, restrictGuests }