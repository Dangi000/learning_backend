import { asyncHandler } from "../utils/asyncHandler.js"; // Middleware to handle async functions and catch errors
import { ApiError } from "../utils/ApiError.js"; // Custom error class to handle API errors
import { User } from "../models/user.model.js"; // User model for MongoDB
import { uploadOnCloudinary } from "../utils/cloudinary.js"; // Utility function to upload images to Cloudinary
import { apiResponse } from "../utils/ApiResponse.js"; // Utility to structure API responses

const registerUser = asyncHandler(async (req, res) => {
  // Destructuring user details from the request body
  const { fullName, email, username, password } = req.body;
  // console.log("UserName :  ", userName, "password  : ", password);
  console.log("FILES: ", req.files); // Log files to check multer output
  console.log("BODY: ", req.body);

  // Check if any field (fullName, email, userName, password) is empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if a user already exists with the same username or email
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // If the user already exists, throw a 409 Conflict error
  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  // Getting the paths of avatar and cover image from the request files
 
  const avatarLocalPath = req.files?.avatar [0]?.path
  // const coverImageLocalPath = req.files?.coverImage
  //   ? req.files.coverImage[0].path
  //   : null;

 let coverImageLocalPath;
if(req.files && Array.isArray(req.files.coverImage)  && req.files.coverImage.length > 0){
  coverImageLocalPath = req.files.coverImage[0].path
}




  // Check if the avatar file is missing in the request
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is  required");
  }

  // Uploading the avatar and cover images to Cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log("Avatar local file path:", avatarLocalPath);
    console.log("Cover image local file path:", coverImageLocalPath);
    

  // If the avatar fails to upload, throw an error

 
  if (!avatar) {

    throw new ApiError(400, "Error uploading avatar");

  }

  // Creating a new user object in the database

  console.log( "this the path of avatar ",avatar.url)
  
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email, 
    password,
    username: username.toLowerCase()
})


  // Retrieve the created user without the password and refreshToken fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // If the user was not created successfully, throw a 500 Internal Server Error
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }


  


  // Return the success response with the created user's details
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registration successful"));
});

export { registerUser };


