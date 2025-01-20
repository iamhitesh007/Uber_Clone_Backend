import jwt from "jsonwebtoken";
import User from "../Model/user.model.js";
import BlackListedTokenModel from "../Model/blacklistedToken.model.js";

export const userAuthMiddleware = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.includes("Bearer")) {
      token = req.headers.authorization.replace("Bearer ", "");
    } else {
      token = req?.headers.authorization;
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }

    const isBlackListed = await BlackListedTokenModel.findOne({ token });
    if (isBlackListed) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const user = await User.findOne({
      _id: decoded.id,
      email: decoded.email,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // if user is found, add user to req object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
