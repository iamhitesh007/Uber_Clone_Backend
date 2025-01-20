import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      firstName: {
        type: String,
        required: [true, "FirstName is Required"],
        trim: true,
        minlength: [3, "First name shoud be minimum 3 characters long"],
      },
      lastName: {
        type: String,
        trim: true,
        minlength: [3, "Last name should be minimum 3 characters long"],
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    profile: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    socketId: {
      type: String, // for live tracking of user
    },

    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    role: {
      type: String,
      enum: ["user", "captain", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.statics.hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );

  return token;
};

const User = mongoose.model("user", userSchema);

export default User;
