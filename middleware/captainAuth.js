import jwt from "jsonwebtoken";
import CaptainModel from "../Model/captain.model.js";
import BlackListedTokenModel from "../Model/blacklistedToken.model.js";

const captainAuth = async (req, res, next) => {
  try {
    let token =
      req?.headers?.authorization?.split(" ")[1] || req?.headers?.authorization;

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

    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY,
      function (err, decoded) {
        if (err) {
          return res.status(401).json({
            status: "fail",
            message: "Unauthorized",
          });
        } else {
          return decoded;
        }
      }
    );
    const captain = await CaptainModel.findOne({ _id: decoded.id });
    if (!captain) {
      return res.status(401).json({
        status: "fail",
        message: "Unauthorized",
      });
    }

    req.captain = captain;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "fail",
      message: "Internal Server Error",
    });
  }
};

export default captainAuth;
