import express from "express";
import { body } from "express-validator";
import {
  loginUser,
  logOut,
  RegisterUser,
  updateUser,
  userProfile,
} from "../Controllers/user.controller.js";
import upload from "../utils/multer.js";
import { userAuthMiddleware } from "../middleware/userAuth.js";

const router = express.Router();

router
  .route("/register")
  .post(
    [
      body("fullName.firstName")
        .isLength({ min: 3 })
        .withMessage("First name shoud be minimum 3 characters long"),
      body("email").isEmail().withMessage("Invalid Email"),
      body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
    ],
    RegisterUser
  );

router
  .route("/login")
  .post(
    [body("email").isEmail().withMessage("Invalid Email"), body("password")],
    loginUser
  );

router
  .route("/update")
  .post(userAuthMiddleware, upload.single("profile"), updateUser);

router.route("/profile").get(userAuthMiddleware, userProfile);

router.route("/logout").get(userAuthMiddleware, logOut);

export default router;
