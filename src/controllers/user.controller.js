import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from 'fs'

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  // Validation for Empty Fields
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
     throw new ApiError(400, "All Fields are required");
  }

  // Checking Existing User
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "User Already Register");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
   throw new ApiError(400, "Avatar not found");
  }
  if (!coverLocalPath) {
    throw new ApiError(400, "Cover Image not found");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverLocalPath);


  if (!avatar) {
   throw new ApiError(400, "Cover Image not found");
}

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username: username.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(400, "Unable to Register");
}

    // Deleteing Local Images
  fs.unlinkSync(avatarLocalPath)
  fs.unlinkSync(coverLocalPath)

  return res
    .status(201)
    .json(new ApiResponse(200 , createdUser , "User Created Successfully"));
});

const loginUser = asyncHandler(async (req,res)=>{
    const {email, username , password} = req.body

    if(!username || email){
      throw new ApiError(400, "Username or Email is Required")
    }

    const userDetails = await User.findOne({
      $or : [{email} , {username}]
    })

    

})



export { registerUser, loginUser };