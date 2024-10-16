import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  // Destructure the name and description from the request body
  const { name, description } = req.body;

  // Assume user authentication is in place, and the user ID is stored in req.user
  const userId = req.user._id;

  // Check if the name field is provided; if not, throw an error with a 400 status code
  if (!name) {
    throw new ApiError(400, "Playlist name is required.");
  }

  // Create a new Playlist instance using the provided name, description, and authenticated user ID
  // Initialize the 'videos' field with an empty array, since no videos are added at creation
  const playlist = new Playlist({
    name,
    description,
    user: userId,
    videos: [], // Initialize with an empty video array
  });

  // Save the playlist to the database
  await playlist.save();

  // Send a 201 response with the newly created playlist and a success message
  res
    .status(201)
    .json(new ApiResponse(playlist, "Playlist created successfully."));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  // Extract userId from request parameters (req.params).
  const { userId } = req.params;

  // Check if the provided userId is a valid MongoDB ObjectId. If not, throw a 400 (Bad Request) error.
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID.");
  }

  // Query the Playlist model to find all playlists associated with the given userId.
  const playlists = await Playlist.find({ user: userId });

  // If no playlists are found for the user, throw a 404 (Not Found) error.
  if (!playlists) {
    throw new ApiError(404, "No playlists found for the user.");
  }

  // If playlists are found, respond with a 200 status and send the playlists along with a success message.
  res
    .status(200)
    .json(new ApiResponse(playlists, "User playlists fetched successfully."));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  // Extract playlistId from the route parameters (e.g., /playlists/:playlistId)
  const { playlistId } = req.params;

  // Check if the playlistId is a valid MongoDB ObjectId
  if (!isValidObjectId(playlistId)) {
    // If the ID is invalid, throw a 400 Bad Request error with a custom message
    throw new ApiError(400, "Invalid playlist ID.");
  }

  // Try to find the playlist by its ID in the database
  const playlist = await Playlist.findById(playlistId);

  // If no playlist is found, throw a 404 Not Found error
  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  // If the playlist is found, return it in the response with a 200 status code and a success message
  res
    .status(200)
    .json(new ApiResponse(playlist, "Playlist fetched successfully."));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  // Destructure playlistId and videoId from the request parameters
  const { playlistId, videoId } = req.params;

  // Validate if the provided playlistId and videoId are valid MongoDB Object IDs
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    // If either ID is invalid, throw a 400 Bad Request error
    throw new ApiError(400, "Invalid playlist or video ID.");
  }

  // Fetch the playlist by its ID from the database
  const playlist = await Playlist.findById(playlistId);

  // If the playlist is not found, throw a 404 Not Found error
  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  // Check if the video is already in the playlist to avoid duplicates
  if (playlist.videos.includes(videoId)) {
    // If the video is already in the playlist, throw a 400 Bad Request error
    throw new ApiError(400, "Video is already in the playlist.");
  }

  // If the video is not in the playlist, add it to the videos array
  playlist.videos.push(videoId);

  // Save the updated playlist back to the database
  await playlist.save();

  // Return a successful response with the updated playlist and a success message
  res.status(200).json(new ApiResponse(playlist, "Video added to playlist."));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // Extracting playlistId and videoId from the request parameters
  const { playlistId, videoId } = req.params;

  // Validate that both IDs are valid MongoDB ObjectIDs
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist or video ID."); // Throw an error if IDs are invalid
  }

  // Retrieve the playlist from the database using the playlistId
  const playlist = await Playlist.findById(playlistId);

  // Check if the playlist exists
  if (!playlist) {
    throw new ApiError(404, "Playlist not found."); // Throw an error if the playlist is not found
  }

  // Filter out the videoId from the playlist's videos array
  playlist.videos = playlist.videos.filter((id) => id.toString() !== videoId);

  // Save the updated playlist back to the database
  await playlist.save();

  // Send a response back to the client with the updated playlist and a success message
  res
    .status(200)
    .json(new ApiResponse(playlist, "Video removed from playlist."));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID.");
  }

  const playlist = await Playlist.findByIdAndDelete(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  res.status(200).json(new ApiResponse(null, "Playlist deleted successfully."));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  // Extract the playlist ID from the request parameters
  const { playlistId } = req.params;

  // Extract the name and description from the request body
  const { name, description } = req.body;

  // Check if the playlist ID is a valid MongoDB Object ID
  if (!isValidObjectId(playlistId)) {
    // If the ID is invalid, throw a 400 error with a message
    throw new ApiError(400, "Invalid playlist ID.");
  }

  // Attempt to find the playlist in the database using the provided ID
  const playlist = await Playlist.findById(playlistId);

  // If the playlist does not exist, throw a 404 error
  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  // Update the playlist name if a new name is provided in the request
  if (name) playlist.name = name;

  // Update the playlist description if a new description is provided
  if (description) playlist.description = description;

  // Save the updated playlist back to the database
  await playlist.save();

  // Respond with a success status and the updated playlist data
  res
    .status(200)
    .json(new ApiResponse(playlist, "Playlist updated successfully."));
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
