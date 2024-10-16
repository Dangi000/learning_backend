import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params; // Get channelId from URL parameters

  // Validate channelId
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Get total subscribers
  const totalSubscribers = await Subscription.countDocuments({ channelId });

  // Get total videos
  const totalVideos = await Video.countDocuments({ channelId });

  // Get total views from all videos
  const totalViews = await Video.aggregate([
    { $match: { channelId } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  // Get total likes from all videos
  const totalLikes = await Like.countDocuments({
    videoId: { $in: await Video.find({ channelId }).distinct("_id") },
  });

  // Prepare stats object
  const stats = {
    totalSubscribers,
    totalVideos,
    totalViews: totalViews[0] ? totalViews[0].totalViews : 0, // Safeguard against empty result
    totalLikes,
  };

  // Send response
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Channel statistics retrieved successfully", stats)
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params; // Get channelId from URL parameters

  // Validate channelId
  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  // Get all videos uploaded by the channel
  const videos = await Video.find({ channelId }).sort({ createdAt: -1 }); // Assuming createdAt exists for sorting

  // Check if videos exist
  if (!videos.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, "No videos found for this channel", []));
  }

  // Send response
  return res
    .status(200)
    .json(new ApiResponse(200, "Videos retrieved successfully", videos));
});

export { getChannelStats, getChannelVideos };
