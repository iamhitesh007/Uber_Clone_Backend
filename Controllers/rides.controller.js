import { validationResult } from "express-validator";
import {
  getDistanceAndTimeService,
  getFareDetailsService,
} from "../Services/map.services.js";
import {
  confirmRideService,
  createRideService,
  endRideService,
  makePaymentService,
  startRideService,
} from "../Services/ride.services.js";
import RidesModel from "../Model/rides.model.js";
import { io } from "../server.js";
import { findAvailableCaptainService } from "../Services/captain.services.js";

export const createRides = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }

  const { pickup, destination, vehicleType } = req?.body;
  if (!pickup || !destination || !vehicleType) {
    return res.status(400).json({
      status: "fail",
      message: "Pickup and Destination are required",
    });
  }

  const { distance, duration } = await getDistanceAndTimeService(
    pickup,
    destination
  );

  if (!distance || !duration) {
    return res.status(400).json({
      status: "fail",
      message: "Failed to get distance and duration",
    });
  }

  const calculateFare = await getFareDetailsService(
    distance.value,
    vehicleType
  );

  if (!calculateFare) {
    return res.status(400).json({
      status: "fail",
      message: "Failed to calculate fare",
    });
  }

  const otp = await RidesModel.generatOTP();

  const newRide = await createRideService({
    user: req?.user?._id,
    pickup,
    destination,
    distance: distance.value,
    duration: duration.value,
    fare: calculateFare,
    vehicleType,
    otp,
  });

  if (!newRide) {
    return res.status(400).json({
      status: "fail",
      message: "Failed to create ride",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Ride created successfully",
    data: {
      newRide,
    },
  });

  const captains = await findAvailableCaptainService(
    pickup,
    newRide.vehicleType
  );

  const user = req?.user;
  newRide.otp = "";

  if (captains.length === 0) {
    io.to(req?.user?.socketId).emit("driverNotFound", {
      data: null,
    });
  }

  captains.forEach((captain) => {
    console.log(captain.socketId);
    io.to(captain.socketId).emit("new-ride", {
      newRide,
      user,
    });
  });
};

export const confirmRide = async (req, res, next) => {
  const captainId = req?.captain?._id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }

  const { rideId } = req?.body;

  if (!rideId) {
    return res.status(400).json({
      status: "fail",
      message: "Ride Id is required",
    });
  }

  const ride = await RidesModel.findById(rideId);
  if (!ride) {
    return res.status(404).json({
      status: "fail",
      message: "Ride not found",
    });
  }

  if (ride.status !== "Pending") {
    return res.status(400).json({
      status: "fail",
      message: "Ride is not pending",
    });
  }

  const rideConfirm = await confirmRideService(rideId, captainId);

  if (!rideConfirm) {
    return res.status(400).json({
      status: "fail",
      message: "Failed to confirm ride",
    });
  }

  io.to(rideConfirm.user.socketId).emit("confirm-ride", {
    data: rideConfirm,
  });

  res.status(200).json({
    status: "success",
    message: "Ride confirmed successfully",
  });
};

export const StartRide = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }

  const { rideId, otp } = req?.body;

  if (!rideId || !otp) {
    return res.status(400).json({
      status: "fail",
      message: "Ride Id and OTP are required",
    });
  }

  const ride = await RidesModel.findById(rideId);
  if (!ride) {
    return res.status(404).json({
      status: "fail",
      message: "Ride not found",
    });
  }

  if (ride.status !== "Accepted") {
    return res.status(400).json({
      status: "fail",
      message: "Ride is not accepted",
    });
  }

  const startNewRide = await startRideService(rideId, otp);

  if (!startNewRide) {
    return res.status(400).json({
      status: "fail",
      message: "Failed to start ride",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Ride started successfully",
  });

  io.to(startNewRide.user.socketId).emit("ride-started", {
    data: startNewRide,
  });
};

export const makePayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }
  const { rideId } = req?.body;

  const ride = await RidesModel.findById(rideId);
  if (!ride) {
    return res.status(404).json({
      status: "fail",
      message: "Ride not found",
    });
  }

  if (ride.status !== "OnGoing") {
    return res.status(400).json({
      status: "fail",
      message: "Ride is not ongoing",
    });
  }

  const makePayment = await makePaymentService(rideId);

  if (!makePayment) {
    return res.status(400).json({
      status: "fail",
      message: "Failed to make payment",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Payment made successfully",
  });

  console.log(makePayment.captain.socketId);

  io.to(makePayment.captain.socketId).emit("finish-ride", {
    data: makePayment,
  });
};

export const EndRide = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "fail",
      errors: errors.array(),
    });
  }

  const { rideId } = req?.body;

  const ride = await RidesModel.findById(rideId);
  if (!ride) {
    return res.status(404).json({
      status: "fail",
      message: "Ride not found",
    });
  }

  if (ride.status !== "OnGoing") {
    return res.status(400).json({
      status: "fail",
      message: "Ride is not on going",
    });
  }

  const endRide = await endRideService(rideId);

  if (!endRide) {
    return res.status(400).json({
      status: "fail",
      message: "Failed to end ride",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Ride ended successfully",
  });

  io.to(endRide.user.socketId).emit("ride-ended", {
    data: endRide,
  });
};
