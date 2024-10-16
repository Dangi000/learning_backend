import { ApiError } from "../utils/ApiError.js"; // Importing custom error handling utility
import { ApiResponse } from "../utils/ApiResponse.js"; // Importing custom response utility
import { asyncHandler } from "../utils/asyncHandler.js"; // Importing async handler utility

// Health check controller function
const healthcheck = asyncHandler(async (req, res) => {
    // Build a health check response
    // Respond with a JSON object indicating the service is up and running
    return res.status(200).json(new ApiResponse(200, "OK")); // Send a 200 response with message "OK"
});

// Exporting the health check function for use in routes
export {
    healthcheck
};
