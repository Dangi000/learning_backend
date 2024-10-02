import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Route for user registration with file upload
router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 }, // Avatar upload
    { name: "coverImage", maxCount: 1 }, // Cover image upload
  ]),

  registerUser // Proceed to controller after file upload
);

// Correctly export router as userRouter
export const userRouter = router;
