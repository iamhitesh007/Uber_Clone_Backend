import CaptainModel from "../Model/captain.model.js";
import RidesModel from "../Model/rides.model.js";
import { getLatLongFromAddress } from "./map.services.js";

export const RegisterCaptainService = async ({
  fullName,
  email,
  password,
  vehicle,
  gender,
}) => {
  try {
    if (!fullName || !email || !password || !vehicle) {
      throw new Error("Please fill in all fields");
    }

    const captain = await CaptainModel.create({
      fullName: {
        firstName: fullName?.firstName,
        lastName: fullName?.lastName,
      },
      email,
      password,
      vehicle: {
        plate: vehicle?.plate,
        capacity: vehicle?.capacity,
        type: vehicle?.type,
        color: vehicle?.color,
      },
      gender,
    });

    return captain;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateDriverLocationService = async (captainId, location) => {
  if (!captainId || !location) {
    throw new Error("Please fill in all fields");
  }

  try {
    const captain = await CaptainModel.findByIdAndUpdate(captainId, location, {
      new: true,
    });
    return captain;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const findAvailableCaptainService = async (location, vehicleType) => {
  if (!location || !vehicleType) {
    throw new Error("Please fill in all fields");
  }

  const { latitude, longitude } = await getLatLongFromAddress(location);

  try {
    const captains = await CaptainModel.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: 50000,
        },
      },
      drivingStatus: "available",
      "vehicle.type": vehicleType,
    });

    return captains;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getTodaysRidesService = async (captainId) => {
  if (!captainId) {
    throw new Error("Please fill in all fields");
  }
  try {
    const rides = await RidesModel.find({
      captain: captainId,
      status: "Completed",

      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59)),
      },
    });

    const totlaEarning =
      Math.round(rides?.reduce((acc, ride) => acc + ride.fare, 0)) || 0;

    const totelTime = rides?.reduce((acc, ride) => acc + ride.duration, 0) || 0;

    const timeInHours = totelTime / 3600 || 0;

    let totalDistance =
      rides?.reduce((acc, ride) => acc + ride.distance, 0) || 0;

    let totalDistanceInKm = totalDistance / 1000 || 0;

    return {
      rides,
      timeInHours,
      totlaEarning,
      totalDistanceInKm,
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
