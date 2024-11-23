const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const router = express.Router();

// Show registration form
router.get('/register', (req, res) => {
  res.render('register.ejs'); 
});


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

// Show login form
router.get('/login', (req, res) => {
  res.render('login.ejs');
});

router.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).send('Email and password are required'); 
      }

      const user = await User.findOne({ email });

      if (!user) {
          return res.status(400).send('Invalid email or password');
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
          return res.status(400).send('Invalid email or password'); 
      }

      req.session.userId = user._id;
      res.redirect('/activities');
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Error logging in');
  }
});



// Handle logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
      if (err) {
          console.error('Error during logout:', err);
          return res.status(500).send('Error during logout');
      }
      res.redirect('/login'); 
  });
});


module.exports = router;
