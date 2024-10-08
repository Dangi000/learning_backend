import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

// Route for user registration with file upload
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 }, // Avatar upload
    { name: "coverImage", maxCount: 1 }, // Cover image upload
  ]),

  registerUser // Proceed to controller after file upload
);


router.route("/login").post(loginUser)


router.route("/logout").post(   verifyJWT , logoutUser)
router.route("/refresh-token").post(refreshAccessToken)

export const userRouter = router;
