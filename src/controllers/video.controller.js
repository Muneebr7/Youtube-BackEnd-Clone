import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import path from "path";
import fs from "fs";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, "All Fiels Are Requried");
  }

  const videoLocalPath = req.file.path;

  if (!videoLocalPath) {
    throw new ApiError(404, "unable to get video local path");
  }

  const publishedVideo = await uploadToCloudinary(videoLocalPath);

  if (!publishedVideo) {
    throw new ApiError(400, "Unable to Upload a Video File");
  }

  const videoUrl = publishedVideo.url;
  const thumbnail = videoUrl.replace(path.extname(videoUrl), ".jpg");

  const video = await Video.create({
    videoFile: videoUrl,
    thumbnail: thumbnail,
    title,
    description,
    duration: Math.floor(publishedVideo.duration),
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiError(400, "Unable to Store Data to Database");
  }

  fs.unlinkSync(videoLocalPath);
  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video Uploaded Successfully"));
});

export { getAllVideos, publishAVideo };
