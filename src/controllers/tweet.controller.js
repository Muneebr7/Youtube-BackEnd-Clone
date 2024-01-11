import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  const ownerId = req.user?._id;

  if (!content) {
    throw new ApiError(400, "Content is reaquired");
  }

  if (!ownerId) {
    throw new ApiError(400, "You need to login first.");
  }

  const tweet = await Tweet.create({
    content,
    owner: new mongoose.Types.ObjectId(ownerId),
  });

  if (!tweet) {
    throw new ApiError(400, "Unable To Create Tweet");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "Tweet is created"));
});



export { createTweet }
