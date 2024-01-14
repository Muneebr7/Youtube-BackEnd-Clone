import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;

  //TODO: create playlist
  if (!userId) {
    throw new ApiError(400, "You need to login first");
  }

  if (!(name && description)) {
    throw new ApiError(400, "All Fields are required");
  }

  const playList = await Playlist.create({
    name,
    description,
    owner: new mongoose.Types.ObjectId(userId),
  });

  if (!playList) {
    throw new ApiError(400, "Unable to Create Playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User Id Is Invalid");
  }

  const userPlaylist = await Playlist.find({
    owner : new mongoose.Types.ObjectId(userId)
  })

  if(!userPlaylist){
    throw new ApiError(400,  "Unbale to Fetch Playlist")
  }

  return res.status(200).json(new ApiResponse(200, userPlaylist[0] , "User playlist fetched"))

});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if(!isValidObjectId(playlistId)){
    throw new ApiError(400, "playlist Id is not valid")
  }

  const playlist = await Playlist.findById(playlistId)

  if(!playlist){
    throw new ApiError(400, "Unable to fetch Playlist")
  }

  return res.status(200).json(new ApiResponse(200, playlist, "PlayList Fetched"))

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  


});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
