const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')

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
const sample = array => array[Math.floor(Math.random() * array.length)];  // for select title of camp we use array
const seedDb = async () => {
    await Campground.deleteMany({})
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            // my Id default for creater of campgrounds
            author: '6420194d5e22a4a7f530afc9',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                // we have longitude & latitude alredy in file so we just take that coordinates from it & display in map
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dttq6tsnz/image/upload/v1679377881/Yelp-Camp/sqwlmkshc1mklzgpjscw.png',
                    filename: 'Yelp-Camp/sqwlmkshc1mklzgpjscw',

                },
                {
                    url: 'https://res.cloudinary.com/dttq6tsnz/image/upload/v1679375279/Yelp-Camp/wonqjkysepq76gfe9imb.jpg',
                    filename: 'Yelp-Camp/wonqjkysepq76gfe9imb',
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Error eius consequuntur atque mollitia et? Quibusdam saepe quisquam, obcaecati nesciunt ullam sapiente. Delectus impedit, natus soluta assumenda dicta amet facilis neque?',
            price: price
        })

        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close()
})