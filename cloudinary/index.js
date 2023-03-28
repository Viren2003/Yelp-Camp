const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// we config the cloudinary so we use our secret, api & keys from .env file & use cloudinary storage to store the images on cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary, // Store in our cloudinary Account
    params: {
        folder: 'Yelp-Camp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    },
    maxCount: 10 // maximum 10 imgs upload on this campground
});

module.exports = ({
    cloudinary,
    storage
})