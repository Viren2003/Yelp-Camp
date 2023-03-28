// all function of reviews is here so we can access that as object in our routes as methods
const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    //    res.send('Review Submited !')
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // set author in review before saving review so who make review we can see it in db.
    review.author = req.user._id;
    // push review in the campground model & save it.
    campground.reviews.push(review);
    await review.save()
    await campground.save();
    req.flash('success', 'Successfully Create a Review !');
    res.redirect(`/campground/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // it take id from reviews array & then delete frmo that array
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfull Delete a Review !');
    res.redirect(`/campground/${id}`);
}