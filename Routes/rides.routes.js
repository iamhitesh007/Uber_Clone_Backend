import express from "express";
import { body } from "express-validator";
import { userAuthMiddleware } from "../middleware/userAuth.js";
import captainAuth from "../middleware/captainAuth.js";
import {
  confirmRide,
  createRides,
  EndRide,
  makePayment,
  StartRide,
} from "../Controllers/rides.controller.js";

const router = express.Router();

router
  .route("/create-ride")
  .post(
    userAuthMiddleware,
    [
      body("pickup").isLength({ min: 3 }).withMessage("Pickup is required"),
      body("destination")
        .isLength({ min: 3 })
        .withMessage("Destination is required"),
      body("vehicleType")
        .isIn(["Car", "Motorcycle", "Auto"])
        .withMessage("Invalid vehicle type"),
    ],
    createRides
  );

router
  .route("/confirm-ride")
  .patch(
    captainAuth,
    [body("rideId").isMongoId().withMessage("Invalid Ride Id")],
    confirmRide
  );

router
  .route("/start-ride")
  .patch(
    captainAuth,
    [
      body("rideId").isMongoId().withMessage("Invalid Ride Id"),
      body("otp").isLength({ min: 6 }).withMessage("Invalid OTP"),
    ],
    StartRide
  );

router
  .route("/make-payment")
  .patch(
    userAuthMiddleware,
    [body("rideId").isMongoId().withMessage("Invalid Ride Id")],
    makePayment
  );

router
  .route("/end-ride")
  .patch(
    captainAuth,
    [body("rideId").isMongoId().withMessage("Invalid Ride Id")],
    EndRide
  );

export default router;
