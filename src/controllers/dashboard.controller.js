import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const channelId = req.user?._id
    
    


})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const channelId = req.user?._id

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel ID is incorrect")
    }

    const videos = await Video.findOne({
        owner : new mongoose.Types.ObjectId(channelId)
    })

    if(!videos){
        throw new ApiError(400, "unable to fetch videos")
    }

    return res.status(200).json(new ApiResponse(200, videos , "Videos Fetched Successfully"))



})

export {
    getChannelStats, 
    getChannelVideos
    }