import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js"; // Import Video model for video operations
//import { User } from "../models/user.model.js"; // Import User model if user-related operations are needed
import { ApiError } from "../utils/ApiError.js"; // Utility for handling API errors
import { ApiResponse } from "../utils/ApiResponse.js"; // Utility for sending API responses
import { asyncHandler } from "../utils/asyncHandler.js"; // Middleware for handling async errors
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Utility for uploading files to Cloudinary

const getAllVideos = asyncHandler(async (req, res) => {
  // Destructure query parameters for pagination, filtering, and sorting
  const {
    page = 1, // Default to page 1
    limit = 10, // Default to 10 videos per page
    query, // Search query for filtering videos by title
    sortBy = "createdAt", // Sort by 'createdAt' field by default
    sortType = "desc", // Sort in descending order by default
    userId, // Optional filter for videos from a specific user
  } = req.query;

  // Set pagination and sorting options
  const options = {
    page: Number(page), // Convert page number to an integer
    limit: Number(limit), // Convert limit to an integer
    sort: { [sortBy]: sortType === "asc" ? 1 : -1 }, // Set sort order (1 for ascending, -1 for descending)
  };

  // Initialize filters object for querying
  const filters = {};

  // If a search query is provided, use regex for case-insensitive search by title
  if (query) {
    filters.title = { $regex: query, $options: "i" }; // Case-insensitive matching
  }

  // If a userId is provided, filter videos by that user
  if (userId) {
    filters.userId = userId;
  }

  // Fetch paginated videos based on filters and options
  const videos = await Video.paginate(filters, options);

  // Return the paginated list of videos with a success message
  res.status(200).json(
    new ApiResponse({
      message: "Videos fetched successfully!",
      videos,
    })
  );
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body; // Destructure title and description from request body

  // Ensure that title, description, and video file are provided
  if (!title || !description || !req.file) {
    throw new ApiError(400, "Title, description, and video file are required");
  }

  // Upload the video file to Cloudinary
  const uploadResponse = await uploadOnCloudinary(req.file.path); // Upload video to Cloudinary

  // Create a new video document in the database
  const newVideo = new Video({
    title,
    description,
    url: uploadResponse.secure_url, // Store video URL from Cloudinary
    cloudinaryId: uploadResponse.public_id, // Store Cloudinary ID for reference
  });

  // Save the video document to the database
  await newVideo.save();

  // Return the created video with a success message
  res.status(201).json(
    new ApiResponse({
      message: "Video uploaded and published successfully!",
      video: newVideo, // Include the new video details in the response
    })
  );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params; // Get videoId from request parameters

  // Validate the videoId to ensure it's a valid MongoDB ObjectId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Fetch the video from the database
  const video = await Video.findById(videoId);

  // If the video is not found, return a 404 error
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Return the found video with a success message
  res.status(200).json(
    new ApiResponse({
      message: "Video fetched successfully!",
      video,
    })
  );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params; // Get videoId from request parameters

  // Validate the videoId to ensure it's a valid MongoDB ObjectId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const updates = req.body; // Destructure updated fields from request body

  // If a new file is uploaded, handle Cloudinary file update
  if (req.file) {
    const uploadResponse = await uploadOnCloudinary(req.file.path); // Upload the new video file to Cloudinary
    updates.url = uploadResponse.secure_url; // Update the video URL
    updates.cloudinaryId = uploadResponse.public_id; // Update Cloudinary ID
  }

  // Update the video document in the database with the new data
  const updatedVideo = await Video.findByIdAndUpdate(videoId, updates, {
    new: true, // Return the updated video document
  });

  // If the video is not found, return a 404 error
  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  // Return the updated video with a success message
  res.status(200).json(
    new ApiResponse({
      message: "Video updated successfully!",
      video: updatedVideo, // Include updated video details
    })
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params; // Get videoId from request parameters

  // Validate the videoId to ensure it's a valid MongoDB ObjectId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Find the video in the database to delete
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // First, delete the video file from Cloudinary
  await uploadOnCloudinary.destroy(video.cloudinaryId); // Assuming destroy method exists for deletion

  // Then, delete the video document from the database
  await Video.findByIdAndDelete(videoId);

  // Return a 204 No Content response with a success message
  res.status(204).json({
    message: "Video deleted successfully!",
  });
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params; // Get videoId from request parameters

  // Validate the videoId to ensure it's a valid MongoDB ObjectId
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Fetch the video from the database
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Toggle the publish status (flip between true and false)
  video.isPublished = !video.isPublished;
  await video.save(); // Save the updated video

  // Return the updated video with a success message
  res.status(200).json(
    new ApiResponse({
      message: `Video ${video.isPublished ? "published" : "unpublished"} successfully!`,
      video, // Include updated video details
    })
  );
});

// Export the functions for use in routes
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
