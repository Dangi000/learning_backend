import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  // Extract the video ID from the request parameters
  const { videoId } = req.params;

  // Assuming the user is authenticated and their ID is stored in `req.user._id`
  const userId = req.user._id;

  // Check if the provided video ID is a valid MongoDB ObjectId
  if (!isValidObjectId(videoId)) {
    // If not valid, throw a custom error (Bad Request, 400) using ApiError utility
    throw new ApiError(400, "Invalid video ID");
  }

  // Check if the user has already liked this video by searching for a like
  // where the video ID and user ID match
  const like = await Like.findOne({ video: videoId, user: userId });

  if (like) {
    // If a like is found, that means the user has already liked the video.
    // So we need to "unlike" it by removing the like document.
    await like.remove();

    // Respond with a success message indicating that the video was unliked
    return ApiResponse.success(res, "Video unliked successfully", {});
  } else {
    // If no like is found, that means the user hasn't liked the video yet.
    // So, we create a new like for this video by saving a new Like document
    const newLike = new Like({
      user: userId, // Associate the like with the current user
      video: videoId, // Associate the like with the given video
    });

    // Save the new like in the database
    await newLike.save();

    // Respond with a success message indicating the video was liked
    // Also return the newly created like object for additional data if needed
    return ApiResponse.success(res, "Video liked successfully", newLike);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  // Extract the 'commentId' from the request parameters and 'userId' from the authenticated user (req.user)
  const { commentId } = req.params;
  const userId = req.user._id;

  // Check if the provided 'commentId' is a valid MongoDB ObjectId
  if (!isValidObjectId(commentId)) {
    // If not valid, throw an API error with a 400 status code (Bad Request)
    throw new ApiError(400, "Invalid comment ID");
  }

  // Check if the user has already liked this comment by querying the Like collection
  const like = await Like.findOne({ comment: commentId, user: userId });

  if (like) {
    // If a like already exists, remove it (unlike the comment)
    await like.remove();
    // Send a success response indicating the comment was unliked
    return ApiResponse.success(res, "Comment unliked successfully", {});
  } else {
    // If no like exists, create a new Like entry for the comment
    const newLike = new Like({
      user: userId, // Reference to the user who is liking the comment
      comment: commentId, // Reference to the comment being liked
    });
    // Save the new Like entry to the database
    await newLike.save();
    // Send a success response indicating the comment was liked
    return ApiResponse.success(res, "Comment liked successfully", newLike);
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweetId");
  }

  const like = await Like.findOne({ tweet: tweetId, user: userId });

  if (like) {
    await like.remove();
    return ApiResponse.success(res, "tweet unliked successfully", {});
  } else {
    const newLike = new Like({
      user: userId,
      tweet: tweetId,
    });
    await newLike.save();
    return ApiResponse.success(res, "tweet liked successfully");
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedVideos = await Like.find({
    user: userId,
    video: { $exists: true },
  }).populate("video"); // Assuming `video` is a reference to the Video model

  return ApiResponse.success(
    res,
    "Liked videos fetched successfully",
    likedVideos
  );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
