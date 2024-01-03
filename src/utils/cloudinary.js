import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: 'dlfworxvp',
  api_key: '152499621844133',
  api_secret: 'kAJf7_m5HHeep29xBs9YoO7pJ0k',
});

const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    // File Upload Success
    console.log(response.url);
    return response;
  } catch (error) {
    fs.unlink(filePath); //remove local file if error
    return null;
  }
};

export { uploadToCloudinary };
