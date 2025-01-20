import express from "express";
import { body } from "express-validator";
import {
  CaptainProfile,
  CaptainRideHistory,
  LoginCaptain,
  LogoutCaptain,
  RegisterCaptain,
  updateDrivingStatus,
} from "../Controllers/captain.controller.js";
import upload from "../utils/multer.js";
import captainAuth from "../middleware/captainAuth.js";

const Router = express.Router();

Router.route("/register").post(
  [
    body("fullName.firstName")
      .isLength({ min: 3 })
      .withMessage("Firstname should be at least 3 characters long"),

    body("email").isEmail().withMessage("Invalid Email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password should be at least 8 characters long"),
    //   body("password").isStrongPassword().withMessage("Password should be strong"),
    body("vehicle.type")
      .isIn(["Car", "Motorcycle", "Auto"])
      .withMessage("Please Provide Valid Type"),

    body("vehicle.color")
      .isLength({ min: 3 })
      .withMessage("Color should be at least 3 characters long"),

    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity should be atleast 1"),

    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Plate should be at least 3 characters long"),
  ],
  upload.fields([{ name: "images", maxCount: 5 }]),
  RegisterCaptain
);

Router.route("/login").post(
  [
    body("email").isEmail().withMessage("Invalid Email or password"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("invalid Email or Password"),
  ],
  LoginCaptain
);

Router.route("/profile").get(captainAuth, CaptainProfile);

Router.route("/ride-history").get(captainAuth, CaptainRideHistory);

Router.route("/update-status").patch(captainAuth, updateDrivingStatus);

Router.route("/logout").get(captainAuth, LogoutCaptain);

export default Router;
