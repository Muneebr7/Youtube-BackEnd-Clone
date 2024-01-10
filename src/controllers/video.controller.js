import mongoose, { mongo } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const video = await Video.aggregatePaginate(
    {
      $match: {
        $match: {
          title: query,
        },
      },
    },
    {
      page,
      limit,
      sort: { createdAt: parseInt(sortBy) },
    }
  );

  if (!video) {
    throw new ApiError(404, "Unable to Find videos");
  }

  return res.status(200).json(new ApiResponse(200, video, "Video Details"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, "All Fiels Are Requried");
  }

  const videoLocalPath = req.files.video[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  if (!videoLocalPath) {
    throw new ApiError(404, "unable to get video local path");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(404, "unable to get Thumbnail local path");
  }

  const publishedVideo = await uploadToCloudinary(videoLocalPath);
  const videoThumbnail = await uploadToCloudinary(thumbnailLocalPath);

  if (!publishedVideo) {
    throw new ApiError(400, "Unable to Upload a Video File to Cloudinary");
  }

  if (!videoThumbnail) {
    throw new ApiError(400, " Unable to upload video Thumbnail to Cloudinary");
  }

  const video = await Video.create({
    videoFile: publishedVideo.url,
    thumbnail: videoThumbnail.url,
    title,
    description,
    duration: Math.floor(publishedVideo.duration),
    owner: req.user?._id,
  });

  if (!video) {
    throw new ApiError(400, "Unable to Store Data to Database");
  }

  fs.unlinkSync(videoLocalPath);
  fs.unlinkSync(thumbnailLocalPath);
  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video Uploaded Successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              email: 1,
              fullName: 1,
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  if (!video) {
    throw new ApiError(404, "cant find Video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video Fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(400, "You Need To login First");
  }

  const { title, description } = req.body;

  if (!(title && description)) {
    throw new ApiError(400, "All Fields are Required");
  }

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(404, "Thumbnail Local Path is not found");
  }

  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new ApiError(400, "Error While Uploading to Cloudinary");
  }

  const video = await Video.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(videoId),
      owner: new mongoose.Types.ObjectId(ownerId),
    },
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
      },
    },
    {
      new: true,
    }
  );

  if (!video) {
    throw new ApiError(400, "Unable to Update The Video Data");
  }

  fs.unlinkSync(thumbnailLocalPath);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Details Successfully Updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(400, "Login to Delete");
  }

  const video = await Video.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(videoId),
    owner: new mongoose.Types.ObjectId(ownerId),
  });

  if (!video) {
    throw new ApiError(400, "Unable to Delete Your video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Video Deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(400, "Login First");
  }

  const videoDetails = await Video.findOne({
    _id : new mongoose.Types.ObjectId(videoId),
    owner : new mongoose.Types.ObjectId(ownerId)
  })

  videoDetails.isPublic = !videoDetails.isPublic
  
  const video = await videoDetails.save()


  if (!video) {
    throw new ApiError(400, "Unable to change the status");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Status Changed"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
