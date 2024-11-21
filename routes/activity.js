const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('./middleware/auth');
const Activity = require('../models/Activity'); // Your Activity model

// Index route: List all activities
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const activities = await Activity.find({});
    console.log('Rendering file:', 'activities/index');
    res.render('activities/home.ejs', { activities }); // No need for './views/' prefix
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).send('Internal Server Error');
  }
});

// New route: Form to create a new activity
router.get('/new', isAuthenticated, (req, res) => {
  res.render('activities/new'); // Correct path
});

// Show route: View details of one activity
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    res.render('activities/show', { activity }); // Correct path
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Edit route: Form to edit an activity
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    res.render('activities/edit', { activity }); // Correct path
  } catch (error) {
    console.error('Error fetching activity for editing:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Create route: Add a new activity
router.post('/', isAuthenticated, async (req, res) => {
  try {
    await Activity.create(req.body);
    res.redirect('/activities'); // Redirect to the index page
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(400).send('Error creating activity');
  }
});

// Update route: Update an existing activity
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    await Activity.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/activities/${req.params.id}`);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(400).send('Error updating activity');
  }
});

// Delete route: Remove an activity
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.redirect('/activities');
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(400).send('Error deleting activity');
  }
});

module.exports = router;
