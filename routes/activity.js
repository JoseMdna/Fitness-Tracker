const express = require('express')
const router = express.Router()
const { isAuthenticated, restrictGuests } = require('./middleware/authenticate')
const Activity = require('../models/activity');
const { validateOwnership } = require('./middleware/authorize')


router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find({})
    res.render('activities/home.ejs', { 
      activities,
      userId: req.session.userId,
      isGuest: req.session.isGuest,
    })
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
})


router.get('/new', isAuthenticated, restrictGuests, (req, res) => {
  res.render('activities/new.ejs')
})


router.post('/', isAuthenticated, restrictGuests, async (req, res) => {
  try {
    const newActivity = {
      name: req.body.name,
      duration: req.body.duration,
      date: req.body.date, 
      description: req.body.description,
      userId: req.session.userId,
    }
    await Activity.create(newActivity)
    res.redirect('/activities')
  } catch (error) {
    res.status(400).send('Error creating activity')
  }
})


router.get('/:id/edit', isAuthenticated, validateOwnership, (req, res) => {
  try {
    const isoDate = req.activity.date
    res.render('activities/edit.ejs', { 
      activity: req.activity, 
      isoDate, 
    })
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
})


router.put('/:id', isAuthenticated, validateOwnership, async (req, res) => {
  try {
    const updatedData = {
      name: req.body.name,
      duration: req.body.duration,
      date: req.body.date, 
      description: req.body.description,
    }
    await req.activity.updateOne(updatedData)
    res.redirect(`/activities/${req.params.id}`)
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
})


router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId
    if (!userId) {
      return res.status(403).send('You must be logged in to view your profile.')
    }
    const activities = await Activity.find({ userId })
    res.render('activities/profile.ejs', { activities })
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
})


router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
    if (!activity) {
      return res.status(404).send('Activity not found')
    }
    const formattedDate = activity.date
    res.render('activities/show.ejs', {
      activity,
      formattedDate, 
    })
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
})


router.delete('/:id', isAuthenticated, validateOwnership, async (req, res) => {
  try {
    await req.activity.deleteOne()
    res.redirect('/activities')
  } catch (error) {
    res.status(500).send('Internal Server Error')
  }
})

module.exports = router
