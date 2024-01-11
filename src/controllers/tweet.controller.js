import mongoose, { mongo } from "mongoose";
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

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  const tweets = await Tweet.find({
    owner: new mongoose.Types.ObjectId(userId),
  });

  if (!tweets) {
    throw new ApiError(404, "Tweets not found");
  }

  return res.status(200).json(new ApiResponse(200, tweets, "Tweets Fetched"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { content } = req.body;
  const userId = req.user?._id;
  const { tweetId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Login First");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      content,
    },
    {
      new: true,
    }
  );

  if (!tweet) {
    throw new ApiError(400, "Unable To Update the tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const userId = req.user?._id;
  const { tweetId } = req.params;

  if (!userId) {
    throw new ApiError(400, "Login First");
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId);

  if (!tweet) {
    throw new ApiError(400, "There is not Tweet Exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet Deleted Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
