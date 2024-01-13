import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "You Need To Login First")
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400, "You Need To Login First")
    }

    const subscribers =  await  Subscription.aggregate([
        {
            $match : {
                channel :  new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField: "subscriber",
                foreignField : "_id",
                as : "subscriberDetails"
            }
        },
        {
            $unwind : "$subscriberDetails"
        },
        {
            $project: {
                _id : 0,
                subscriber : "$subscriberDetails"
            }
        }
    ])

    if(!subscribers){
        throw new ApiError(400, "unable to fetch subscribers")
    }

    return res.status(200).json(new ApiResponse(200, subscribers , "Subscribers Fetched"))



})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscribedChannels =  await  Subscription.aggregate([
        {
            $match : {
                subscriber :  new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField: "channel",
                foreignField : "_id",
                as : "channelDetails"
            }
        },
        {
            $unwind : "$channelDetails"
        },
        {
            $project: {
                _id : 0,
                subscriber : "$channelDetails"
            }
        }
    ])

    if(!subscribedChannels){
        throw new ApiError(400,  "unable to fetch subscribed channel details")
    }

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed Channel Fetched"))


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}