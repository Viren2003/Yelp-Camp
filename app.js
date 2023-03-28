// this code check if our app is running on devlopment mode means not deploy in any site so we can acceess the env variable
// not that we can not share secret key's or api if .env file is go to github or something people gonna use them 
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
/*console.log(process.env.SECRET)
console.log(process.env.LOVE)
*/

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const { urlencoded } = require('express');
// const session = require('express-session');
const flash = require('connect-flash'); // for Flash message 
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStragety = require('passport-local'); // the methods like authenticate where we use on user model
const User = require('./models/user')
// use for Session in mongoDB
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Object keys starting with a $ or containing a . are reserved for use by MongoDB as operators. Without this sanitization, malicious users could send an object containing a $ operator, or including a ., which could change the context of a database operation. Most notorious is the $where operator, which can execute arbitrary JavaScript on the database.
const mongoSanitize = require('express-mongo-sanitize'); // use for preventing data.

// for security using helmet package
const helmet = require('helmet')


const userRoutes = require('./routes/user')
const campgroundsRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/review')

// Atlas Database
// const dbURL = process.env.DB_URL  use when we deploy our site
const dbURL = 'mongodb://localhost:27017/yelp-camp'

mongoose.set('strictQuery', false);
mongoose.connect(dbURL, {
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
app.use(express.static(path.join(__dirname, 'public')))  // serving static files  like stylesheet & scripts
app.use(mongoSanitize())
// app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/jquery.min.js",
    "https://api.mapbox.com/mapbox-gl-js/v2.13.0/mapbox-gl.js",
    "https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js",
    "https://cdn.jsdelivr.net/npm/bs-custom-file-input/dist/bs-custom-file-input.min.js"

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://maxcdn.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",
    "https://api.mapbox.com/mapbox-gl-js/v2.13.0/mapbox-gl.css"

];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dttq6tsnz/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Make Store to Store the sessions in db
const secret = process.env.SECRET || 'thisissecret'
const store = MongoStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60, // Save the session for 24 hour in browser & after it user have to login again
    crypto: {
        secret,
    }
});

store.on('error', function (e) {
    console.log('Store Error !!', e)
})


const sessionConfig = {
    store,
    name: 'sessionUser',
    secret,
    // secure:true,   use in only https request when we deploy the site
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // for security reason
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // cookie expire in 7 days
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());


// Passport module code first we initialize the passport then activate the session & use the serilizeUser to connect with  session & deserilize for disconnection

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStragety(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

// make this middleware to access in all templates
app.use((req, res, next) => {
    // console.log(req.session)
    res.locals.returnUrl = req.session.returnTo
    res.locals.currentUser = req.user; //if there is user who is Alredy Sign in so we Show the user Only logout link & if not so we show them only 2 register & login
    res.locals.success = req.flash('success'); // req.flash is method call success key value pair so we can check the flash message !
    res.locals.error = req.flash('error'); // Show the error like flash message
    next();
})
app.get('/fakeuser', async (req, res) => {
    const user = new User({ email: 'viren@gmail.com', username: 'viren' });
    const newUser = await User.register(user, 'v123d');
    res.send(newUser)
});

// for user routes
app.use('/', userRoutes); //All user routes
// For Campgrounds routes
app.use('/campground', campgroundsRoutes)  // All /campground routes is access through it from routes
app.use('/campground/:id/reviews', reviewRoutes) // All review routes is access from it


app.get('/', (req, res) => {
    res.render('home')
})



// All Error Handle On Every Request
app.all('*', (req, res, next) => {
    next(new ExpressError(message = "Page Not Found !", statusCode = 404));
})
// basic error handling
app.use((err, req, res, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    if (!err.message) {
        err.message = "Something Went Wrong !";
    }
    res.status(err.statusCode).render('error', { err });
});
app.listen(3000, () => {
    console.log('listening on port 3000');
})