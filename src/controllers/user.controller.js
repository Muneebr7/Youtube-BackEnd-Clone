import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong While Generating Referesh Token and Access token"
    );
  }
};

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

  const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverLocalPath = req.files?.coverImage[0]?.path;

  if (existingUser) {
    // Deleteing Local Images
    fs.unlinkSync(avatarLocalPath);
     fs.unlinkSync(coverLocalPath);
    throw new ApiError(409, "User Already Register");
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar not found");
  }
  if (!coverLocalPath) {
    throw new ApiError(400, "Cover Image not found");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar Image not found");
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
  fs.unlinkSync(avatarLocalPath);
   fs.unlinkSync(coverLocalPath);

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email is Required");
  }

  const userDetails = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!userDetails) {
    throw new ApiError(404, "User Not Found");
  }

  const isPasswordValid = await userDetails.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Password is not Valid");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userDetails._id
  );

  const loggedInUser = await User.findById(userDetails._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user Logged in Successfully"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logout.."));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unAuthorized Request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(400, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh Token is not matched");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, newrefreshToken: refreshToken },
          "Session Refresh"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Something Went Wrong with RefreshToken");
  }
});

const changePass = asyncHandler(async (req, res) => {
  const { currentPass, newPass } = req.body;
  const user = await User.findById(req.user?._id);

  const isPassCorrect = await user.isPasswordCorrect(currentPass);

  if (!isPassCorrect) {
    throw new ApiError(400, "Current Password is invalid");
  }

  user.password = newPass;

  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getCurrectUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched Successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullName } = req.body;
  const userId = req.user?._id

  if(!userId){
    throw new ApiError(400, "unAuthorized Request")
  }

  if (!email || !fullName) {
    throw new ApiError(400, "All Fields are required");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        email: email,
        fullName,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully"));
});

const changeAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Unable to file avatar local path");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(400, "Unable to Upload Avatar to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, {}, "Avatar is Updated"));
});

const changeCover = asyncHandler(async (req, res) => {
  const coverLocalPath = req.file?.path;
  if (!coverLocalPath) {
    throw new ApiError(400, "Unable to file avatar local path");
  }

  const cover = await uploadToCloudinary(coverLocalPath);
  if (!cover.url) {
    throw new ApiError(400, "Unable to Upload Cover to Cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: cover.url,
      },
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, {}, "Cover is Updated"));
});

const getChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(404, "Cant Find Username");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username,
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        subscribeTo: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        subscribersCount: 1,
        subscribeTo: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
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
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "Watch History Fetched"));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changePass,
  getCurrectUser,
  updateAccountDetails,
  changeAvatar,
  changeCover,
  getChannelProfile,
  getWatchHistory,
};
