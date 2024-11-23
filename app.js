const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const morgan = require('morgan');

require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev')); 
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true })); 

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
}));


const { router: authRoutes, isAuthenticated, restrictGuests } = require('./routes/Auth');
app.use('/', authRoutes); // Mount auth-related routes


const protectedRoutes = require('./routes/protected'); 
app.use('/', protectedRoutes); 

const activityRoutes = require('./routes/activity');
app.use('/activities', isAuthenticated, activityRoutes);


app.get('/', (req, res) => {
    res.render('index.ejs');
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
