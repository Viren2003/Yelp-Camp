const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const catchError = require('./utils/catchError');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi')
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const { urlencoded } = require('express');

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,

})
const db = mongoose.connection;
db.on("error", console.error.bind(console, 'Connection Error'));
db.once('open', () => {
    console.log("Database Connected !");
})

app.engine('ejs', ejsMate); // tell the express where we use templating for adding dynamically content
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// MIDDLE WARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // from postman we can accept the request from middleware
app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/campground', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })

})

// For Making new Campground
app.get('/campground/new', (req, res) => {
    res.render('campgrounds/new')
})
app.post('/campground', catchError(async (req, res, next) => {
    // if (!req.body.campground) {
    //     throw new ExpressError("Invalid Data", 400) // If All Data not Filled by Postman request so we can throw an error through it
    // } this is not work with every error like req.body.price or req.body.location so we usev joi for validate
    const campgroundSchema = Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0)
    }).required();

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400)
    }

    // const { campground } = req.query;
    // const result = campgroundSchema.validate(campground);

    // const campgroundSchema = Joi.object({
    //     campground: Joi.object({
    //         title: Joi.string().required(),
    //         price: Joi.number().required().min(0)
    //     }).required()
    // })
    // const result = campgroundSchema.validate(req.query)
    // console.log(result);
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campground/${newCampground._id}`);
}));

// for Find with id
app.get('/campground/:id', catchError(async (req, res) => {

    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground })
}));

// edit or update info.
app.get('/campground/:id/edit', catchError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground })
}))
// Put request for update campground
app.put('/campground/:id', catchError(async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground); // give a location & title second arg !
    res.redirect(`/campground/${campground._id}`);
}))
// Delete request for Delete Campground !!
app.delete('/campground/:id', catchError(async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campground');
}))

// All Error Handle On Every Request
app.all('*', (req, res, next) => {
    next(new ExpressError(message = "Page Not Found !", statusCode = 404));
})
// basic error handling
app.use((err, req, res, next) => {
    if (!err.message) {
        err.message = "Something Went Wrong !"
    }
    res.status(err.statusCode).render('error', { err });
})
app.listen(3000, () => {
    console.log('listening on port 3000');
})