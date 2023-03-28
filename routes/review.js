const express = require('express');
const router = express.Router({ mergeParams: true });  // access the id of campground from middleWare so we merge with this file 

const Campground = require('../models/campground');
const Review = require('../models/review');

const catchError = require('../utils/catchError');
const { validateReviews, isLoggedIn, verifyReviewAuthor } = require('../middleware')

// access from controller methods of review in this file
const reviews = require('../controllers/reviews')


// For review we make a route : '/campground /: id / reviews' so we can access all review related that campground using that id
router.post('/', isLoggedIn, validateReviews, catchError(reviews.createReview)) // create a review


// Delete A review from campground
// We can delete the review from review id but it store also in the campground as objectId so we have to delete from that reviews array that id
// so in mongoose there is pull operator so it can pull that id from the array than we delete them
// final that route is /campground/campground.id/review/review.id

router.delete('/:reviewId', isLoggedIn, verifyReviewAuthor, catchError(reviews.deleteReview)) // delete a review
module.exports = router;
