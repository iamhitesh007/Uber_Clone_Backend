import express from "express";
import { userAuthMiddleware } from "../middleware/userAuth.js";
import { body, query } from "express-validator";
import {
  getCoordinatesFromAddress,
  getFareDetails,
  getSuggestions,
  getTimeAndDistanceBetweenTwoPoints,
} from "../Controllers/map.controller.js";
const Router = express.Router();

Router.route("/get-latlong").post(
  userAuthMiddleware,
  body("address").isLength({ min: 3 }),

  getCoordinatesFromAddress
);

// Router.route("/get-time-and-distance").post(
//   userAuthMiddleware,
//   [
//     body("pickup.lat")
//       .isFloat({ min: -90, max: 90 })
//       .withMessage("invalid pickup location"),
//     body("pickup.long")
//       .isFloat({ min: -180, max: 180 })
//       .withMessage("invalid pickup location"),
//     body("destination.lat")
//       .isFloat({ min: -90, max: 90 })
//       .withMessage("invalid destination location"),
//     body("destination.long")
//       .isFloat({ min: -180, max: 180 })
//       .withMessage("invalid destination location"),
//   ],
//   getTimeAndDistanceBetweenTwoPoints
// );

Router.route("/get-time-and-distance").post(
  userAuthMiddleware,
  [
    body("pickup")
      .isLength({ min: 3 })
      .withMessage("Please entervalid pickup location"),
    body("destination")
      .isLength({ min: 3 })
      .withMessage("Please enter valid destination location"),
  ],
  getTimeAndDistanceBetweenTwoPoints
);

Router.route("/get-fare-details").post(
  userAuthMiddleware,
  [
    body("pickup")
      .isLength({ min: 3 })
      .withMessage("Please entervalid pickup location"),
    body("destination")
      .isLength({ min: 3 })
      .withMessage("Please enter valid destination location"),
  ],
  getFareDetails
);

Router.route("/get-suggestions").get(
  userAuthMiddleware,
  [query("address").isLength({ min: 1 })],
  getSuggestions
);

export default Router;
