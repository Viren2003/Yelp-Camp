const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;  //  we don't have to type mongoose.schema All Along the way so it work As Variable

// we make virtual Schema for every image so  we can apply some methods on it like width set to 300px & access that property on to template
const ImageSchema = new Schema({
    url: String,
    filename: String
})
// thumbnail access when it required so we can not just push into models
ImageSchema.virtual('thumbnail').get(function () {
    //  replace a link upload/id , upload/w_300/id/....
    return this.url.replace('/upload', '/upload/w_300');
})
//By default, Mongoose does not include virtuals when you convert a document to JSON. For example, if you pass a document to Express' res.json() function, virtuals will not be included by default.
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    // image: String,
    // Store the coOrdinates of location which is given by user here !
    geometry: {
        type: {
            type: String,
            enum: ['Point'],  //  always be point for location
            required: true
        },
        coordinates: {
            type: [Number], // geometry longitude & latitude store as array
            required: true
        }
    },
    images: [ImageSchema],
    description: String,
    location: String,
    // take user model as Author & store in campground
    author:
    {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
    ,
    // take review model as one to many relationShip,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

/*
 We Have this Format Of data accepted by mapbox 
  {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [longitude, latitude]
      },
      "properties": {
        "name": "Location Name",
        "description": "Description of location"
      }
    },

Here We have geometry inside of campground but still we have to add properties object so in mongoose it don't provide directly bcz of geoJson data so we Set option mongooose that add the geoJson on the campground That we set virtual "properties" object then it gonna add to the campground.

*/

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<b><a href="/campground/${this._id}">${this.title} </a></b><br>
    <p>${this.location}</p>`
})






// Delete The Campground With Alll reviews so we use middleWare findOneAndDelete, using the reviews id & delete all review with campground
// remember that post method run after query call
CampgroundSchema.post('findOneAndDelete', async function (campgroundwithReview) {
    if (campgroundwithReview) {
        await review.deleteMany({
            _id: { $in: campgroundwithReview.reviews } // if the review in campground it delete  that
        })
    }
    // console.log('Reviews Deleted !!')
})
module.exports = mongoose.model('Campground', CampgroundSchema);