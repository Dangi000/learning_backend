import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv"; // Make sure dotenv is imported and initialized

dotenv.config(); // Load environment variables from .env file

const app = express();

// Enable CORS with credentials and dynamic origin
app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // Set in your .env (e.g., http://localhost:3000)
    credentials: true, // Allow sending cookies
  })
);

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: "10mb" })); // Increase body size limit if needed
app.use(express.urlencoded({ extended: true, limit: "100mb" })); // For form submissions

// Serve static files from the public folder (useful for static assets like images, css)
app.use(express.static("public"));

// Enable parsing cookies
app.use(cookieParser());

// Route import (ES module compliant with ".js" extension)
import { userRouter } from "./routes/user.routes.js";

// Register user routes
app.use("/api/v1/users", userRouter);

// Export the app instance
export { app };
