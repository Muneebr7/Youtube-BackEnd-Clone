import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const  userId  = req.user?._id;
  const { content } = req.body;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "You need to login First");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  if (!content) {
    throw new ApiError(400, "You need to add something to comment");
  }

  const comment = await Comment.create({
    content,
    video : new  mongoose.Types.ObjectId(videoId),
    owner: new mongoose.Types.ObjectId(userId)
  })

  if(!comment){
    throw new ApiError(400, "Unable to Save Comment")
  }

  return res.status(200).json(new ApiResponse(200, comment , "Comment added successfully"))



});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
const {commentId} = req.params
const {content } = req.body  
const userId = req.user?._id

if(!content){
    throw new ApiError(400, "Add something to comment")
}

if(!isValidObjectId(commentId)){
    throw new ApiError(400, "Comment ID is Invalid")
}
if(!isValidObjectId(userId)){
    throw new ApiError(400, "You Need to login First")
}

const comment = await Comment.findByIdAndUpdate(commentId ,{
    content
},
{
    new : true
})

if(!comment){
    throw new ApiError(400, "Unable to Update Comment")
}

return res.status(200).json(new ApiResponse(200, comment, "Comment is Updated"))

});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const {commentId} = req.params
  const userId = req.user?._id

  
  if(!isValidObjectId(commentId)){
      throw new ApiError(400, "Comment ID is Invalid")
  }
  if(!isValidObjectId(userId)){
      throw new ApiError(400, "You Need to login First")
  }
  
  const comment = await Comment.findByIdAndDelete(commentId)
  
  if(!comment){
      throw new ApiError(400, "Unable to Delete Comment")
  }
  
  return res.status(200).json(new ApiResponse(200, {}, "Comment is Deleted"))    


});

export { getVideoComments, addComment, updateComment, deleteComment };
