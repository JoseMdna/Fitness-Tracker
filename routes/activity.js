const express = require('express');
const router = express.Router();
const { isAuthenticated, restrictGuests } = require('./middleware/authenticate');
const Activity = require('../models/Activity');
const mongoose = require('mongoose');
const User = require('../models/User'); 


// Index route: List all activities
router.get('/', isAuthenticated, async (req, res) => {
  try {
      const activities = await Activity.find({});

      const formattedActivities = activities.map(activity => {
          const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' };
          return {
              ...activity.toObject(), 
              formattedDate: new Date(activity.date).toLocaleDateString('en-US', options),
          };
      });

      res.render('activities/home.ejs', { activities: formattedActivities });
  } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).send('Internal Server Error');
  }
});


// New route: Form to create a new activity
router.get('/new', isAuthenticated, async (req, res) => {
  try {
      console.log('Session userId:', req.session.userId); 

      if (!req.session.userId) {
          return res.redirect('/login'); 
      }

      const user = await User.findById(req.session.userId); 

      if (!user) {
          return res.status(404).send('User not found');
      }

      console.log('User fetched:', user); 
      res.render('activities/new.ejs', { user }); 
  } catch (error) {
      console.error('Error rendering new activity form:', error);
      res.status(500).send('Internal Server Error');
  }
});




router.get('/:id', isAuthenticated, async (req, res) => {
  try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return res.status(400).send('Invalid Activity ID');
      }

      const activity = await Activity.findById(req.params.id);

      if (!activity) {
          return res.status(404).send('Activity not found');
      }

   
      const formattedDate = activity.date.toISOString().split('T')[0]; 

      res.render('activities/show.ejs', { activity, formattedDate });
  } catch (error) {
      console.error('Error fetching activity:', error);
      res.status(500).send('Internal Server Error');
  }
});




// Edit route: Form to edit an activity
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    res.render('activities/edit.ejs', { activity }); 
  } catch (error) {
    console.error('Error fetching activity for editing:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create route: Add a new activity
router.post('/', restrictGuests, isAuthenticated, async (req, res) => {
  try {
    req.body.userId = req.session.userId; 
    req.body.date = new Date(`${req.body.date}T00:00:00.000Z`); 
    await Activity.create(req.body);
    res.redirect('/activities'); 
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(400).send('Error creating activity');
  }
});
// Update route: Update an existing activity
router.put('/:id', restrictGuests, isAuthenticated, async (req, res) => {
  try {
      const updatedData = {
          ...req.body,
          date: new Date(`${req.body.date}T00:00:00.000Z`), 
      };

      await Activity.findByIdAndUpdate(req.params.id, updatedData);
      res.redirect(`/activities/${req.params.id}`);
  } catch (error) {
      console.error('Error updating activity:', error);
      res.status(400).send('Error updating activity');
  }
});

// Delete route: Remove an activity
router.delete('/:id', restrictGuests, isAuthenticated, async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.redirect('/activities');
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(400).send('Error deleting activity');
  }
});

module.exports = router;
