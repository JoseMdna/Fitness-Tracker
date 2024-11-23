const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const router = express.Router();

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId || req.session.isGuest) {
        return next(); 
    }
    res.redirect('/login'); 
}

// Middleware to block guests from modifying data
function restrictGuests(req, res, next) {
    if (req.session.isGuest) {
        return res.redirect('/register'); r
    }
    next();
}

// Define auth-related routes
router.get('/register', (req, res) => res.render('register.ejs'));
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ email, password: hashedPassword });
        res.redirect('/login');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Error creating user');
    }
});

router.get('/login', (req, res) => res.render('login.ejs'));
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.redirect('/activities');
        } else {
            res.status(400).send('Invalid email or password');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Error logging in');
    }
});

router.post('/guest', (req, res) => {
    req.session.isGuest = true;
    res.redirect('/activities');
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            res.status(500).send('Error during logout');
        } else {
            res.redirect('/login');
        }
    });
});


module.exports = { router, isAuthenticated, restrictGuests };
