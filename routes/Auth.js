const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User'); 
const router = express.Router();

// Show registration form
router.get('/register', (req, res) => {
  res.render('register.ejs'); 
});


router.post('/register', (req, res) => {
  let body = '';


  req.on('data', (chunk) => {
    body += chunk.toString(); 
  });

  req.on('end', async () => {
    try {
      const parsedBody = new URLSearchParams(body);

      const email = parsedBody.get('email');
      const password = parsedBody.get('password');

      const hashedPassword = await bcrypt.hash(password, 10);

    
      await User.create({ email, password: hashedPassword });

      res.redirect('/login'); 
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send('Error creating user');
    }
  });
});

// Show login form
router.get('/login', (req, res) => {
  res.render('login.ejs');
});


router.post('/login', (req, res) => {
  let body = '';


  req.on('data', (chunk) => {
    body += chunk.toString(); 
  });

  req.on('end', async () => {
    try {
      const parsedBody = new URLSearchParams(body);

      const email = parsedBody.get('email');
      const password = parsedBody.get('password');

      const user = await User.findOne({ email });

      if (user && (await bcrypt.compare(password, user.password))) {
        req.session.userId = user._id; 
        res.redirect('/'); 
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).send('Error logging in');
    }
  });
});

// Handle logout
router.post('/logout', (req, res) => {
  console.log('Logout route hit');

  req.session.destroy((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).send('Error during logout'); 
    }
    console.log('Session destroyed successfully'); 
    res.send('Logout successful'); 
  });
});


module.exports = router;
