import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import {uploadToCloudinary} from  '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

const regiserUser = asyncHandler( async (req,res)=>{

    const {fullName , email, username , password} =  req.body
    
    // Validation for Empty Fields
    if([fullName,email,username,password].some(field => field?.trim() === "" )){
        throw ApiError(400 , "All Fields are required")
    }

    // Checking Existing User
    const existingUser = user.findOne({
        $or : [{email} , {username}]
    })

    if(existingUser){
        throw ApiError(409, "User Already Register")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path

    if(!avatarLocalPath) throw ApiError(400,"Avatar not found")
    if(!coverLocalPath) throw ApiError(400,"Cover Image not found")
    
    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverLocalPath)

    if(!avatar) throw ApiError(400,"Avatar Not Uploaded")
    

   const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        username: username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select( "-password -refreshToken")
    if(!createdUser) throw ApiError(400, "Unable to Register")

   return res.status(201).json(
    new ApiResponse(200 , createdUser , "User Registered Successfully")
   )

})


export {
    regiserUser,
}