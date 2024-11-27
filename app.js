const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const morgan = require('morgan');
const MongoStore = require('connect-mongo');
const User = require('./models/User');
const Activity = require('./models/Activity');
const { isAuthenticated, restrictGuests } = require('./routes/middleware/authenticate');
const protectedRoutes = require('./routes/protected');
const activityRoutes = require('./routes/activity');
require('dotenv').config();

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

const PORT = process.env.PORT || 3000;

app.use(morgan('dev'));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret', 
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true, 
        maxAge: 1000 * 60 * 60 * 24
    }
})); // <-- Missing closing parenthesis added here

app.use(async (req, res, next) => {
    if (req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            res.locals.user = user;
            res.locals.isGuest = false;
        } catch (error) {
            res.locals.user = null;
            res.locals.isGuest = false;
        }
    } else if (req.session.isGuest) {
        res.locals.user = { email: 'Guest' };
        res.locals.isGuest = true;
    } else {
        res.locals.user = null;
        res.locals.isGuest = true;
    }
    next();
});

app.get('/', (req, res) => {
    res.render('index.ejs');
});

const { router: authRoutes } = require('./routes/Auth');
app.use('/', authRoutes);

app.use('/protected', isAuthenticated, protectedRoutes);

app.use('/activities', activityRoutes);

app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.session.userId });
        const formattedActivities = activities.map(activity => ({
            ...activity._doc,
            formattedDate: new Date(activity.date).toISOString().split('T')[0],
        }));
        res.render('activities/profile.ejs', { activities: formattedActivities });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});