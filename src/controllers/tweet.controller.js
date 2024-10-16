import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  // Extract content from the request body
  const { content } = req.body;

  // Retrieve user ID from the authenticated request
  const userId = req.user.id;

  // Validate input: Ensure content is not empty
  if (!content || content.trim() === "") {
    // Throw an error if content is empty
    throw new ApiError(400, "Tweet content cannot be empty");
  }

  try {
    // Create a new tweet in the database with the provided content and user ID
    const newTweet = await Tweet.create({ content, user: userId });

    // Respond with a 201 status and a success message, including the new tweet
    return res
      .status(201)
      .json(new ApiResponse(201, "Tweet created successfully", newTweet));
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error creating tweet:", error);

    // Throw a generic internal server error
    throw new ApiError(500, "Internal Server Error");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  // Extract user ID from request parameters (e.g., /tweets/:userId)
  const { userId } = req.params;

  // Validate the user ID to ensure it's a valid MongoDB ObjectId
  if (!isValidObjectId(userId)) {
    // If invalid, throw a 400 error with a message
    throw new ApiError(400, "Invalid user ID");
  }

  try {
    // Fetch tweets from the database for the specified user
    // Populate the user field with selected information (username, email)
    const tweets = await Tweet.find({ user: userId }).populate(
      "user",
      "username email"
    );

    // Return a 200 response with the fetched tweets in a structured format
    return res
      .status(200)
      .json(new ApiResponse(200, "Fetched user tweets successfully", tweets));
  } catch (error) {
    // Log the error to the console for debugging purposes
    console.error("Error fetching user tweets:", error);

    // If an error occurs during the database operation, throw a 500 error
    throw new ApiError(500, "Internal Server Error");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params; // Extract tweet ID from request parameters
  const { content } = req.body; // Extract content from request body

  // Validate input
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet ID");
  }
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Tweet content cannot be empty");
  }

  try {
    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      { content },
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedTweet) {
      throw new ApiError(404, "Tweet not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Tweet updated successfully", updatedTweet));
  } catch (error) {
    console.error("Error updating tweet:", error); // Log the error for debugging
    throw new ApiError(500, "Internal Server Error");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params; // Extract tweet ID from request parameters

    // Validate tweet ID
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    try {
        const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

        if (!deletedTweet) {
            throw new ApiError(404, "Tweet not found");
        }

        return res.status(200).json(new ApiResponse(200, "Tweet deleted successfully"));
    } catch (error) {
        console.error("Error deleting tweet:", error); // Log the error for debugging
        throw new ApiError(500, "Internal Server Error");
    }
});
export { createTweet, getUserTweets, updateTweet, deleteTweet };
