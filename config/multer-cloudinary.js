const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'FarmFresh', // A folder in Cloudinary to store images
        allowed_formats: ['jpeg', 'png', 'jpg']
    }
});

const upload = multer({ storage });

module.exports = {
    cloudinary,
    upload
};