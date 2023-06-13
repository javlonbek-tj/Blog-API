import { v2 as cloudinary } from 'cloudinary';
import { config } from 'dotenv';
config();
import { CloudinaryStorage } from 'multer-storage-cloudinary';

//configure cloudinary

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Instance of cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png', 'jpeg'],
  params: {
    folder: 'blog-api',
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

export default storage;
