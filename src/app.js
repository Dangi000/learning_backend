import express from "express"; // Importing the Express framework for building the server
import cors from "cors"; // Importing CORS for cross-origin resource sharing
import cookieParser from "cookie-parser"; // Importing middleware to parse cookies

const app = express(); // Initializing an Express application

// Middleware for handling Cross-Origin Resource Sharing (CORS)
// This allows requests from the specified origin (in this case, from `process.env.CORS_ORIGIN`)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // CORS origin specified in environment variables
    credentials: true, // Allows cookies to be sent along with requests
  })
);

// Middleware to parse incoming requests with JSON payloads, setting the maximum size of request bodies to 16kb
app.use(express.json({ limit: "16kb" }));

// Middleware to parse URL-encoded data from requests, also with a limit of 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Middleware to serve static files (e.g., images, stylesheets, etc.) from the 'public' directory
app.use(express.static("public"));

// Middleware to parse cookies from the request headers, allowing easy access to them
app.use(cookieParser());

// Importing the route handlers (controllers) for different API endpoints
import userRouter from "./routes/user.routes.js"; // Routes related to user management (e.g., registration, login)
import healthcheckRouter from "./routes/healthcheck.routes.js"; // Route for checking server health
import tweetRouter from "./routes/tweet.routes.js"; // Routes related to tweets or posts
import subscriptionRouter from "./routes/subscription.routes.js"; // Routes related to user subscriptions
import videoRouter from "./routes/video.routes.js"; // Routes related to video management
import commentRouter from "./routes/comment.routes.js"; // Routes for handling comments on content
import likeRouter from "./routes/like.routes.js"; // Routes for managing likes on content
import playlistRouter from "./routes/playlist.routes.js"; // Routes for managing playlists
import dashboardRouter from "./routes/dashboard.routes.js"; // Routes related to user dashboards (analytics, metrics, etc.)

// Defining the base route for each set of routes to make the API structure clear
app.use("/api/v1/healthcheck", healthcheckRouter); // Health check endpoint (e.g., /api/v1/healthcheck)
app.use("/api/v1/users", userRouter); // User management endpoints (e.g., /api/v1/users/register)
app.use("/api/v1/tweets", tweetRouter); // Tweet-related endpoints (e.g., /api/v1/tweets)
app.use("/api/v1/subscriptions", subscriptionRouter); // Subscription-related endpoints (e.g., /api/v1/subscriptions)
app.use("/api/v1/videos", videoRouter); // Video-related endpoints (e.g., /api/v1/videos)
app.use("/api/v1/comments", commentRouter); // Comment-related endpoints (e.g., /api/v1/comments)
app.use("/api/v1/likes", likeRouter); // Like-related endpoints (e.g., /api/v1/likes)
app.use("/api/v1/playlist", playlistRouter); // Playlist-related endpoints (e.g., /api/v1/playlist)
app.use("/api/v1/dashboard", dashboardRouter); // Dashboard-related endpoints (e.g., /api/v1/dashboard)

// Example API endpoint: http://localhost:8000/api/v1/users/register

export { app }; // Exporting the Express app instance for use in other files (e.g., server.js)
