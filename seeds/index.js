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
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Error eius consequuntur atque mollitia et? Quibusdam saepe quisquam, obcaecati nesciunt ullam sapiente. Delectus impedit, natus soluta assumenda dicta amet facilis neque?',
            price: price
        })

        await camp.save();
    }
}

seedDb().then(() => {
    mongoose.connection.close()
})