// all methods of user is here
const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register');
}

module.exports.RegisterUser = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerUser = await User.register(user, password);
        // console.log(registerUser)
        // now if once use register then we use req.login to direct login the user after it register itSelf.Once it happen that greaat.
        req.login(registerUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to YelpCamp now you can book a campground')
            res.redirect('/campground')
        })

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLoginPage = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    const redirectUrl = req.session.returnTo || '/campground'
    req.flash('success', 'Welcome Back !');
    res.redirect(redirectUrl)
}

module.exports.logOut = (req, res) => {
    req.logout(() => { // add callback function here
        req.flash('success', 'Goodbye!');
        res.redirect('/campground');
    });
}