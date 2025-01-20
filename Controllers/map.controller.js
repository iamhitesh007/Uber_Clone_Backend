import {
  getLatLongFromAddress,
  getDistanceAndTimeService,
  getSuggestionsService,
  getFareDetailsService,
  getFareDetailsServiceForAllVehicle,
} from "../Services/map.services.js";
import { validationResult } from "express-validator";

export async function getCoordinatesFromAddress(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "fail", errors: errors.array() });
    }

    const { address } = req?.body;

    const { latitude, longitude } = await getLatLongFromAddress(address);

    if (!latitude || !longitude) {
      return res.status(404).json({
        status: "fail",
        message: "lat long not found.",
      });
    }

    return res.json({
      status: "success",
      message: "Lat and Long Fetched Successfully",
      data: { latitude, longitude },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
}

export async function getTimeAndDistanceBetweenTwoPoints(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "fail",
        errors: errors.array(),
      });
    }

    const { pickup, destination } = req?.body;

    if (!pickup || !destination) {
      return res.status(404).json({
        status: "fail",
        message: "Pickup and Destination are required",
      });
    }

    const { distance, duration } = await getDistanceAndTimeService(
      pickup,
      destination
    );

    if (!distance || !duration) {
      return res.status(404).json({
        status: "fail",
        message: "Distance and Duration not found.",
      });
    }

    return res.json({
      status: "success",
      message: "Distance and Duration Fetched Successfully",
      data: { distance, duration },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
}

export async function getSuggestions(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "fail",
        errors: errors.array(),
      });
    }

    const { address } = req?.query;

    if (!address) {
      return res.status(404).json({
        status: "fail",
        message: "Address is required",
      });
    }

    const suggestions = await getSuggestionsService(address);

    if (!suggestions) {
      return res.status(404).json({
        status: "fail",
        message: "Suggestions not found.",
      });
    }

    return res.json({
      status: "success",
      message: "Suggestions Fetched Successfully",
      data: { suggestions },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
}

export async function getFareDetails(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }

  const { pickup, destination } = req?.body;

  if (!pickup || !destination) {
    return res.status(404).json({
      status: "fail",
      message: "Pickup and Destination are required",
    });
  }

  const { distance, duration } = await getDistanceAndTimeService(
    pickup,
    destination
  );

  if (!distance || !duration) {
    return res.status(404).json({
      status: "fail",
      message: "Distance and Duration not found",
    });
  }
  const fares = await getFareDetailsServiceForAllVehicle(distance.value);

  if (!fares) {
    return res.status(404).json({
      status: "fail",
      message: "Fare not found",
    });
  }

  return res.json({
    status: "success",
    message: "Fare Fetched Successfully",
    data: { fares, distance: distance.text },
  });
}
