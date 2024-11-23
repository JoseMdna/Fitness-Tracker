const mongoose = require('mongoose');
const User = require('../models/User');


const activitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    duration: { type: Number, required: true }, 
    date: { type: Date, default: Date.now },   
});

module.exports = mongoose.model('Activity', activitySchema);
