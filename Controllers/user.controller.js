import User from "../Model/user.model.js";
import { validationResult } from "express-validator";
import { registerUser, UpdateUser } from "../Services/user.services.js";
import BlackListedTokenModel from "../Model/blacklistedToken.model.js";

export const RegisterUser = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, password, gender } = req?.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already in use",
      });
    }

    const hashedPassword = await User.hashPassword(password);

    const user = await registerUser({
      firstName: fullName.firstName,
      lastName: fullName?.lastName,
      email,
      password: hashedPassword,
      gender,
    });
    const token = await user.generateToken();

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "fail",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    const token = user.generateToken();

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        user,
        token,
      },
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: "fail", errors: errors.array() });
    }

    const id = req?.user?._id;

    let profile;
    if (req?.file) {
      const { path } = req.file;
      profile = path.replace(/\\/g, "/");
    }

    const updatedUser = await UpdateUser(id, { ...req?.body, profile });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: {
        updatedUser,
      },
    });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
};

export const userProfile = async (req, res, next) => {
  const user = req?.user;
  res.status(200).json({
    status: "success",
    message: "User pofile fetched successfully",
    data: {
      user,
    },
  });
};

export const logOut = async (req, res, next) => {
  const token = req?.headers.authorization?.split(" ")[1];

  await BlackListedTokenModel.create({ token });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
