import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");
    if (!token) {
      throw new ApiError(400, "unAuthorized Request");
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const currentUser = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );
  
    if (!currentUser) {
      throw new ApiError(401, "Invalid Access Token");
    }
  
    req.user = currentUser
    next()
  } catch (error) {
    console.log("auth middleware eror")
  }

});
