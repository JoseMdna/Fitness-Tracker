const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
})

module.exports = mongoose.models.Activity || mongoose.model('activity', activitySchema);
