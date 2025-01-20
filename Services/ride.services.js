import CaptainModel from "../Model/captain.model.js";
import RidesModel from "../Model/rides.model.js";

export const createRideService = async ({
  user,
  pickup,
  destination,
  distance,
  duration,
  fare,
  vehicleType,
  otp,
}) => {
  if (
    !user ||
    !pickup ||
    !destination ||
    !distance ||
    !duration ||
    !fare ||
    !otp
  ) {
    throw new Error("Missing required fields");
  }

  const newRide = await RidesModel.create({
    user,
    pickup,
    destination,
    distance,
    duration,
    fare,
    vehicleType,
    otp,
  });
  return newRide;
};

export const confirmRideService = async (rideId, captainId) => {
  if (!rideId || !captainId) {
    throw new Error("Missing required fields");
  }
  await RidesModel.findByIdAndUpdate(
    rideId,
    {
      status: "Accepted",
      captain: captainId,
    },
    {
      new: true,
    }
  );

  await CaptainModel.findByIdAndUpdate(captainId, { drivingStatus: "onRide" });

  const ride = await RidesModel.findById(rideId).populate("user captain");

  return ride;
};

export const startRideService = async (rideId, otp) => {
  if (!rideId || !otp) {
    throw new Error("Missing required fields");
  }

  const ride = await RidesModel.findById(rideId).populate("user captain");

  if (ride.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  await RidesModel.findByIdAndUpdate(
    rideId,
    {
      status: "OnGoing",
      startTime: new Date(),
    },
    {
      new: true,
    }
  );

  return ride;
};

export const endRideService = async (rideId) => {
  if (!rideId) {
    throw new Error("Missing required fields");
  }
  const ride = await RidesModel.findById(rideId).populate("user captain");

  await RidesModel.findByIdAndUpdate(
    rideId,
    {
      status: "Completed",
      endTime: new Date(),
    },
    {
      new: true,
    }
  );

  await CaptainModel.findByIdAndUpdate(ride.captain._id, {
    drivingStatus: "available",
  });

  return ride;
};

export const makePaymentService = async (rideId) => {
  if (!rideId) {
    throw new Error("Missing required fields");
  }
  const ride = await RidesModel.findById(rideId).populate("user captain");

  await RidesModel.findByIdAndUpdate(
    rideId,
    {
      paymentStatus: "paid",
    },
    {
      new: true,
    }
  );

  return ride;
};
