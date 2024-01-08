import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv'

dotenv.config({
  path : './.env'
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      media_metadata: true,
    });
    return response;
  } catch (error) {
    fs.unlinkSync(filePath); //remove local file if error
    return error
  }
};

export { uploadToCloudinary };
