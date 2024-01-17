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

    if(!isValidObjectId(channelId) || !channelId){
        throw new ApiError(400, "unAuthorized Request. please Login")
    }

    // total video Views
    const totalVideoViews = await Video.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group : {
                _id : null,
                totalViews : {$sum : "$views"}
            }
        }
    ])

    if(!totalVideoViews){
        throw new ApiError(400, "Unable to get total Video Views")
    }

    // get Total Subscriber
    const totalSubscribers = await Subscription.countDocuments({
        channel : channelId
    })

    // get Total Videos
    const totalVideos = await Video.countDocuments({
        owner : channelId
    })

    const data = {
        totalSubscribers,
        totalVideoViews,
        totalVideos
    }

    return res.status(200).json(new ApiResponse(200, data , "Fetched Channel Stats"))
    


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