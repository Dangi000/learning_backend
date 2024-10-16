import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params; // Extract channel ID from request parameters
  const userId = req.user.id; // Retrieve user ID from the authenticated request

  // Validate ObjectIDs for both user and channel
  if (!isValidObjectId(channelId) || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid channel or user ID");
  }

  try {
    // Check if the user is already subscribed to the channel
    const subscription = await Subscription.findOne({
      user: userId, // Ensure correct field name
      channel: channelId,
    });

    if (subscription) {
      // Unsubscribe the user if they are already subscribed
      await Subscription.deleteOne({ user: userId, channel: channelId });
      return res
        .status(200)
        .json(new ApiResponse(200, "Unsubscribed successfully"));
    } else {
      // Subscribe the user to the channel
      await Subscription.create({ user: userId, channel: channelId });
      return res
        .status(201)
        .json(new ApiResponse(201, "Subscribed successfully"));
    }
  } catch (error) {
    console.error("Error toggling subscription:", error); // Log the error for debugging
    throw new ApiError(500, "Internal Server Error");
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params; // Extract channel ID from request parameters

  // Validate channel ID
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  try {
    // Query to find all subscribers of the channel
    const subscribers = await Subscription.find({
      channel: channelId,
    }).populate("user", "username email"); // Populate username and email from User model

    return res
      .status(200)
      .json(
        new ApiResponse(200, "Fetched subscribers successfully", subscribers)
      );
  } catch (error) {
    console.error("Error fetching channel subscribers:", error); // Log the error for debugging
    throw new ApiError(500, "Internal Server Error");
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params; // Extract subscriber ID from request parameters

  // Validate subscriber ID
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  try {
    // Fetch subscriptions for the user
    const subscriptions = await Subscription.find({
      user: subscriberId,
    }).populate("channel", "name description"); // Populate name and description from Channel model

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Fetched subscribed channels successfully",
          subscriptions
        )
      );
  } catch (error) {
    console.error("Error fetching subscribed channels:", error); // Log the error for debugging
    throw new ApiError(500, "Internal Server Error");
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
