const express = require('express');
const router = express.Router();
const { isAuthenticated, restrictGuests } = require('./middleware/authenticate');
const Activity = require('../models/Activity');
const { validateOwnership } = require('./middleware/authorize');
const path = require('path');

router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find({});
    const formattedActivities = activities.map(activity => ({
      ...activity.toObject(),
      formattedDate: new Date(activity.date).toISOString().split('T')[0], 
    }));

    res.render('activities/home.ejs', { 
      activities: formattedActivities,
      userId: req.session.userId,
      isGuest: req.session.isGuest
    });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

router.get('/new', isAuthenticated, restrictGuests, (req, res) => {
  res.render('activities/new.ejs');
});

router.post('/', isAuthenticated, restrictGuests, async (req, res) => {
  try {
    const inputDate = new Date(req.body.date);
    const utcDate = new Date(Date.UTC(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate()
    ));

    const newActivity = {
      name: req.body.name,
      duration: req.body.duration,
      date: utcDate,
      description: req.body.description,
      userId: req.session.userId
    };

    await Activity.create(newActivity);
    res.redirect('/activities');
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(400).send('Error creating activity');
  }
});

router.get('/:id/edit', isAuthenticated, validateOwnership, (req, res) => {
  const date = new Date(req.activity.date);
  const isoDate = date.toISOString().split('T')[0];
  res.render('activities/edit.ejs', { 
    activity: req.activity, 
    isoDate 
  });
});

router.put('/:id', isAuthenticated, validateOwnership, async (req, res) => {
  try {
    const inputDate = new Date(req.body.date);
    const utcDate = new Date(Date.UTC(
      inputDate.getFullYear(),
      inputDate.getMonth(),
      inputDate.getDate()
    ));

    const updatedData = {
      name: req.body.name,
      duration: req.body.duration,
      date: utcDate,
      description: req.body.description
    };

    await req.activity.updateOne(updatedData);
    res.redirect(`/activities/${req.params.id}`);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId; 
    if (!userId) {
      return res.status(403).send('You must be logged in to view your profile.');
    }
    const activities = await Activity.find({ userId });
    const formattedActivities = activities.map(activity => ({
      ...activity.toObject(),
      formattedDate: new Date(activity.date).toISOString().split('T')[0],
    }));

    res.render('activities/profile.ejs', { activities: formattedActivities });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
      const activity = await Activity.findById(req.params.id);
      if (!activity) {
          return res.status(404).send('Activity not found');
      }

      const formattedDate = new Date(activity.date).toISOString().split('T')[0]; 

      res.render(path.join(__dirname, '../views/activities/show.ejs'), {
          activity,
          formattedDate,
      });
  } catch (error) {
      res.status(500).send('Internal Server Error');
  }
});

router.delete('/:id', isAuthenticated, validateOwnership, async (req, res) => {
  try {
    await req.activity.deleteOne(); 
    res.redirect('/activities');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;