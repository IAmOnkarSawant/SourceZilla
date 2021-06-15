const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const compression = require('compression');
const morgan = require('morgan')
const favicon = require('serve-favicon');



// const HttpError = require('./models/http-error');

// controller imports
const authController = require('./controllers/authController');
const postController = require('./controllers/postController');
const userController = require('./controllers/userController');
const categoryController = require('./controllers/categoryController');
const adminController = require('./controllers/adminController');
const privateGroupController = require('./controllers/privateGroupController');
const videoStreamingController = require('./controllers/videoStreamingController');
const { deleteFile, upload } = require('./models/db');

// Init
const app = express();

app.use(favicon(path.join(__dirname, 'client', 'public', 'favicon.ico')))


app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(cors());
app.use(compression())

app.set('trust proxy', 1);
 
const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1hr
    max: 100,
    message: 'Too many requests from this IP,please try again later.'
});

// limit body data at 300kb only
app.use(express.json({ limit: '300kb' }));
app.use(express.urlencoded({extended:false}));


app.use(morgan('tiny'))
// Registered Middlewares
app.use('/register', authController);
app.use('/category', categoryController);
app.use('/posts', postController);
app.use('/user', userController);
app.use('/admin', adminController);
app.use('/privategroup', privateGroupController);
app.use('/streamer', videoStreamingController);

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    });
}


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


module.exports = app;