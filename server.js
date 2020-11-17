require('dotenv').config();
require('./models/db');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path')
const morgan = require('morgan')
const compression = require('compression')
const DYNO_URL = 'https://dbms-mern-stack-app.herokuapp.com/'
const wokeUp = require('./wake-up-dyno')


// const HttpError = require('./models/http-error');

// My imports
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');
const userController = require('./controllers/userController');
const categoryController = require('./controllers/categoryController');
const adminController = require('./controllers/adminController');
const privateGroupController = require('./controllers/privateGroupController');
const { deleteFile, upload } = require('./models/db');

// Init
const app = express();

app.use(compression());

// Required Middlewares
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE');

    next();
})

app.use(morgan('tiny'))
// Registered Middlewares
app.use('/register', authController);
app.use('/category', categoryController);
app.use('/posts', postController);
app.use('/user', userController);
app.use('/admin', adminController);
app.use('/privategroup', privateGroupController);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    });
}

// if registered Middlewares don't exist call this middleware to show error
// for unsupported routes
// app.use((req, res, next) => {
//     const error = new HttpError('Could Not Find this Route', 404);
//     throw error;
// })

// Error Handling Middleware
app.use((error, req, res, next) => {
    if (req.file) {
        deleteFile(next, req.file.id)
    }
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
    res.json({ message: error.message || 'An Unknown Error has Occured' })
})


const PORT = process.env.PORT || 4000;

// Server Listener
app.listen(PORT, () => {
    console.log(`App is up and running on PORT No. ${PORT}`)
    wokeUp(DYNO_URL, 60);
});