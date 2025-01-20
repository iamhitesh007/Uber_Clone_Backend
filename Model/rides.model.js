import mongoose from "mongoose";
import crypto from "crypto";

const ridesSchema = new mongoose.Schema(
  {
    captain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "captains",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    pickup: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },

    distance: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    fare: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Completed",
        "Cancelled",
        "Rejected",
        "OnGoing",
      ],
      default: "Pending",
    },

    vehicleType: {
      type: String,
      enum: ["Auto", "Car", "Motorcycle"],
      required: true,
    },

    paymentId: {
      type: String,
    },
    orderId: {
      type: String,
    },
    signature: {
      type: String,
    },

    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending",
    },

    otp: {
      type: String,
    },

    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);

ridesSchema.statics.generatOTP = function () {
  const otp = crypto.randomInt(100000, 1000000); // Generates a number between 100000 and 999999
  return otp;
};

const RidesModel = mongoose.model("rides", ridesSchema);

export default RidesModel;
