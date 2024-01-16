import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  //TODO: toggle like on video

  if (!userId) {
    throw new ApiError(400, "un authorized request");
  }

  const likedVideo = await Like.findOne({
    video: new mongoose.Types.ObjectId(videoId),
    likedBy: new mongoose.Types.ObjectId(userId),
  });

  if (likedVideo) {
    await Like.findByIdAndDelete(likedVideo._id);
    return res.status(200).json(new ApiResponse(200, {}, "unLike success"));
  }

  const newLike = await Like.create({
    video: new mongoose.Types.ObjectId(videoId),
    likedBy: new mongoose.Types.ObjectId(userId),
  });

  if (!newLike) {
    throw new ApiError(400, "Unable To Like");
  }

  return res.status(200).json(new ApiResponse(200, newLike, "Like Success"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const userId = req.user?._id;
  //TODO: toggle like on video

  if (!userId) {
    throw new ApiError(400, "unAuthorized request");
  }

  const likedComment = await Like.findOne({
    comment: new mongoose.Types.ObjectId(commentId),
    likedBy: new mongoose.Types.ObjectId(userId),
  });

  if (likedComment) {
    await Like.findByIdAndDelete(likedComment._id);
    return res.status(200).json(new ApiResponse(200, {}, "unLike success"));
  }

  const newLike = await Like.create({
    comment: new mongoose.Types.ObjectId(commentId),
    likedBy: new mongoose.Types.ObjectId(userId),
  });

  if (!newLike) {
    throw new ApiError(400, "Unable To Like");
  }

  return res.status(200).json(new ApiResponse(200, newLike, "Like Success"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const userId = req.user?._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "unAuthorized Request");
  }

  const tweet = await Like.findOne({
    tweet: new mongoose.Types.ObjectId(tweetId),
    likedBy: new mongoose.Types.ObjectId(userId),
  });

  if (tweet) {
    await Like.findByIdAndDelete(tweet._id);
    return res.status(200).json(new ApiResponse(200, {}, "Unlike Tweet"));
  }

  const likeTweet = await Like.create({
    tweet: new mongoose.Types.ObjectId(tweetId),
    likedBy: new mongoose.Types.ObjectId(userId),
  });

  if (!likeTweet) {
    throw new ApiError(400, "unable to like tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likeTweet, "Like Tweet Success"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const userId = req.user?._id

  if(!isValidObjectId(userId)){
    throw new ApiError(400, "unAuthorized Request")
  }

  const allVideos = await Like.aggregate([
    {
        $match : {
            likedBy : new mongoose.Types.ObjectId(userId),
            video : {$exists : true}
        }
    },
    {
        $lookup : {
            from : "videos",
            localField : "video",
            foreignField : "_id",
            as : "likedVideos"
        },
        
    },
    {
        $project : {
            likedVideos : {$first : "$likedVideos"}
        }
    }
   
  ])

  if(!allVideos){
    throw new ApiError(400, "Unable to Fetch All Liked Video")
  }

  return res.status(200).json(new ApiResponse(200, allVideos, "All Liked videos Fetched"))


});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
