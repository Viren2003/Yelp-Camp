const express = require('express');
const app = express();
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const catchError = require('../utils/catchError');

// we use controller to make route clean so all the method like find user whatever it store in users object
const users = require('../controllers/users')

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// now in router have route method so we can group the route which has same path if we did it so  it become clear file
// like this router.route('/).get(some method or callbacks).post().delete etc

router.route('/register')
    // render form from controller
    .get(users.renderRegisterForm)
    // submit the register form
    .post(catchError(users.RegisterUser))

router.route('/login')
    .get(users.renderLoginPage)
    // passport authenticate check the credintials with database  which is local method & something gone wrong or invalid username & password so it flash the message & if fail so go back to login page & success so go for campground
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)


router.get('/logout', users.logOut);

module.exports = router
