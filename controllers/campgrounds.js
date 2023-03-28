// here we take all functionality of Campground so our route file become redable & put the function like index,showCampground which is object of camprounds

const Campground = require('../models/campground');
// Mapbox Geocoding take name of city & convert into longitude & latitude
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }) // Accessing the methods Forward Geocoding from The Mapbox.

const { cloudinary } = require('../cloudinary');


module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    // if (!req.body.campground) {
    //     throw new ExpressError("Invalid Data", 400) // If All Data not Filled by Postman request so we can throw an error through it
    // } this is not work with every error like req.body.price or req.body.location so we usev joi for validate
    // JOI  is use for Server Side Validation here by validateCampground middleware we select it validation for this route

    // For Get a Longitude & latitude from geoCode
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    // console.log(geoData.body.features[0].geometry.coordinates)
    // res.send(geoData.body.features[0].geometry)

    const newCampground = new Campground(req.body.campground);
    // from req.body we pushe geometry to our db of campground so it save & we see it
    newCampground.geometry = geoData.body.features[0].geometry
    // here in req.body we access the req.files so in the file we save into database url & filename
    newCampground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    // when we making a campground we access to user who currently log in so take that id & save all details on campgrounds
    newCampground.author = req.user._id; // we can save the author in camp

    await newCampground.save();
    // console.log(newCampground);
    req.flash('success', 'Successfully Create a Campground !');
    res.redirect(`/campground/${newCampground._id}`);
}

module.exports.showCampground = async (req, res) => {
    // here wev populate the reviews & author mean user who create a campground
    // const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');

    // but now if user make a comment on campground so we also show in template their name. here we use nested populate first populate review then populate who create review means author then populate the author who created campground
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    // console.log(campground)
    // for check the campground is exist or not if not we flash the message
    if (!campground) {
        req.flash('error', 'Can not Find A Campground !');
        return res.redirect('/campground');
    }
    // console.log(campground);
    res.render('campgrounds/show', { campground })
}

module.exports.renderEditForm = async (req, res) => {
    // here we check if user is Authenticate then he can change & if some user send request from postman to change something so prevent user's campgrounds
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Can not Find A Campground !');
        return res.redirect('/campground');
    }
    req.flash('success', 'Successfully Edit a Campground !');
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const id = req.params.id;
    // console.log(req.body)
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); // give a location & title second arg !
    const img = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...img);
    // if we are delete img of campground we are access from the req.body
    // we set deleteImages Joi validation if any user wanna delete some images we have to delete that img from our database also from the cloudinary
    // so we have campground object and we take img from that using pull operator then we take that filename & compare with our req.body.deleteImages filename if match then we delete from server & also cloudinary
    //  so if we Have to delete photo from cloudinary so we use  cloudinary.uploader.destroy method to delete from cloudinary
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            // take img from request & take the filename & delete them from cloudinary !
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully Update CampGround')
    res.redirect(`/campground/${campground._id}`);
}
module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully Delete a Campground !');
    res.redirect('/campground');
}