const express = require('express');
const router = express.Router();

const catchError = require('../utils/catchError')
const Campground = require('../models/campground')
const { isLoggedIn, validateCampground, verifyAuthor } = require('../middleware');
// we put functionality of campground like createCampground delete whatever in campgrounds object so we can access all method from controller file.
const campgrounds = require('../controllers/campgrounds')

// we use multer with Clodinary so we make stoarge to store the photos on clodinary
const multer = require('multer');
const { storage } = require('../cloudinary') // only one js file so that can access automatically

const upload = multer({ storage })
// const upload = multer({ dest: 'uploads/' }) // create upload folder & upload imgs in binary form

// use router.route to combine all the routes


router.route('/')
    // campgrounds.index show the campground page !
    .get(catchError(campgrounds.index))
    // this route for creating a new campground & functionallity in controllers folder
    // here First the clodinary is upload img then we can verify the campground
    .post(isLoggedIn, upload.array('image'), validateCampground, catchError(campgrounds.createCampground))
// .post(upload.single('image'), (req, res) => {
//     console.log(req.body, req.file) // here which is file gonna upload that file store in req.file
//     res.status(200).send('It Worked !')
// })


// For Making new Campground, for validate user is Authenticated we use the middleWare from passport
// campgrounds.rendernewform is method in controller to render a form to create campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    // for Find with id & showing details about campground & reviews who created it. it's details on controller folder
    .get(catchError(campgrounds.showCampground))
    // Put request for update campground & verify all details than upload or change the thongs
    .put(isLoggedIn, verifyAuthor, upload.array('image'), validateCampground, catchError(campgrounds.updateCampground))

    // Delete request for Delete Campground !!
    .delete(isLoggedIn, catchError(campgrounds.deleteCampground))

// edit or update info.
router.get('/:id/edit', isLoggedIn, verifyAuthor, catchError(campgrounds.renderEditForm))



module.exports = router;