const mongoose = require('mongoose');
const Schema = mongoose.Schema;  //  we don't have to type mongoose.schema All Along the way so it work As Variable

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
});

module.exports = mongoose.model('Campground', CampgroundSchema);