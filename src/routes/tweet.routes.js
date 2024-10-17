import { Router } from "express";
import { 
  createTweet, 
  getUserTweets, 
  updateTweet, 
  deleteTweet 
} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"; // For JWT verification

const router = Router();

// Route for creating a tweet
router.route("/").post(verifyJWT, createTweet);

// Route for getting a user's tweets by their ID
router.route("/user/:userId").get(verifyJWT, getUserTweets);

// Route for updating a tweet by its ID
router.route("/:tweetId").patch(verifyJWT, updateTweet);

// Route for deleting a tweet by its ID
router.route("/:tweetId").delete(verifyJWT, deleteTweet);

export const tweetRouter = router;
