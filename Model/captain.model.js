import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const captainSchema = new mongoose.Schema(
  {
    fullName: {
      firstName: {
        type: String,
        required: true,
        trim: true,
        minlength: [3, "FirstName should be atleast 3 characters long"],
      },
      lastName: {
        type: String,
        trim: true,
        minlength: [3, "LastName should be atleast 3 characters long"],
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [8, "Password should be atleast 8 characters long"],
      select: false,
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },

    socketId: {
      type: String,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },

    drivingStatus: {
      type: String,
      enum: ["onRide", "available", "onBreak"],
      default: "onBreak",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    vehicle: {
      type: {
        type: String,
        enum: ["Car", "Motorcycle", "Auto"],
      },

      color: {
        type: String,
        minlength: [3, "Color name should be atleast 3 characters long"],
      },

      capacity: {
        type: Number,
        min: [1, "Minimum capacity should 1."],
      },

      plate: {
        type: String,
        required: true,
      },

      images: [
        {
          type: String,
        },
      ],
    },

    role: {
      type: String,
      enum: ["captain"],
      default: "captain",
    },
  },
  {
    timestamps: true,
  }
);

captainSchema.index({ location: "2dsphere" });

captainSchema.statics.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

captainSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

captainSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );

  return token;
};

const CaptainModel = mongoose.model("captains", captainSchema);

export default CaptainModel;
