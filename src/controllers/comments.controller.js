import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  // Extract the video ID from the request parameters
  const { videoId } = req.params;

  // Extract pagination parameters from the query string, defaulting to page 1 and limit of 10 comments per page
  const { page = 1, limit = 10 } = req.query;

  // Convert pagination parameters to integers for calculations
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  // Validate the provided video ID to ensure it's a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    // Throw an error if the video ID is invalid
    throw new ApiError(400, "Invalid video ID");
  }

  // Fetch comments associated with the specified video ID
  const comments = await Comment.find({ videoId }) // Find comments for the specified video ID
    .skip((pageNum - 1) * limitNum) // Skip the number of comments based on the current page
    .limit(limitNum) // Limit the number of comments returned based on the specified limit
    .sort({ createdAt: -1 }); // Sort comments by creation date in descending order (newest first)

  // Get the total count of comments for the specified video ID to support pagination
  const totalComments = await Comment.countDocuments({ videoId });

  // Respond with a successful status code and the retrieved comments, along with pagination info
  return res.status(200).json(
    new ApiResponse(200, "Comments retrieved successfully", {
      comments, // The array of comments fetched
      total: totalComments, // Total number of comments for this video
      page: pageNum, // Current page number
      limit: limitNum, // Number of comments per page
    })
  );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content, userId } = req.body; // Assuming userId is sent in the request body

  // Validate input
  if (!content || !userId) {
    throw new ApiError(400, "Content and user ID are required");
  }

  // Validate videoId
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // Create a new comment
  const newComment = new Comment({
    videoId,
    content,
    userId,
  });

  await newComment.save();

  return res
    .status(201)
    .json(new ApiResponse(201, "Comment added successfully", newComment));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  // Validate input
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  // Validate commentId
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Update the comment
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );

  if (!updatedComment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated successfully", updatedComment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Validate commentId
  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  // Delete the comment
  const deletedComment = await Comment.findByIdAndDelete(commentId);

  if (!deletedComment) {
    throw new ApiError(404, "Comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully", deletedComment));
});

export { getVideoComments, addComment, updateComment, deleteComment };
