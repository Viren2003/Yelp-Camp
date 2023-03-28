const ExpressError = require('./utils/ExpressError')
const { campgroundSchema, reviewSchema } = require('./schema.js')
const Campground = require('./models/campground');
const Review = require('./models/review')

module.exports.isLoggedIn = (req, res, next) => {
    // Store the url they are requesting
    // console.log(req.path, req.originalUrl) so we store originalUrl into session so every subsequent request we get back something
    // here we store url where user it into returnTo 
    req.session.returnTo = req.originalUrl
    // it check whether user sign in or not
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in');
        return res.redirect('/login')
    }
    next()
}


//use middleWare toSelect the route & validate information about campground
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
// use middleware to that verify the author is logged in then it can change the campgrouund
module.exports.verifyAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You Do not have the Permission For Changing Information');
        return res.redirect(`/campground/${id}`)
    };
    next()
}
// use middlewar verifyReviewAuthor to check if user id match then he/she can delete from postman or by directRequest otheerWise don't
module.exports.verifyReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId)
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You Do not have the Permission For Changing Information');
        return res.redirect(`/campground/${id}`)
    };
    next()
}

// use middleWare to validate reviews from postman.
module.exports.validateReviews = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
