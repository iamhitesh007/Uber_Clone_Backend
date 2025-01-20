import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./Model/user.model.js";
import CaptainModel from "./Model/captain.model.js";

const InitializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.query.token;

    if (!token || token === "null") {
      return;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      if (!decoded) return next(new Error("Authentication error"));

      if (decoded.role === "user") {
        const user = await User.findById(decoded.id);
        if (!user) return next(new Error("Authentication error"));
        socket.user = user;
      } else {
        const captain = await CaptainModel.findById(decoded.id);
        if (!captain) return next(new Error("Authentication error"));
        socket.captain = captain;
      }

      next();
    } else {
      console.error("Token missing in socket handshake.");
    }
  });

  io.on("connection", (socket) => {
    socket.on("join", async (data) => {
      console.log(data);
      if (data.userType === "user") {
        await User.findByIdAndUpdate(data.userId, { socketId: socket.id });
      } else if (data.userType === "captain") {
        await CaptainModel.findByIdAndUpdate(data.captainId, {
          socketId: socket.id,
        });
      }
    });

    socket.on("locationUpdate", async (data) => {
      if (data?.captainId) {
        const captain = await CaptainModel.findById(data.captainId);
        if (!captain) {
          return;
        }

        await CaptainModel.findByIdAndUpdate(
          data.captainId,
          {
            "location.coordinates": [data.location.lng, data.location.lat],
          },
          { new: true }
        );
      } else if (data?.userId) {
        const user = await User.findById(data.userId);
        if (!user) {
          return;
        }
        await User.findByIdAndUpdate(
          data.userId,
          {
            "location.coordinates": [data.location.lng, data.location.lat],
          },
          { new: true }
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });

  return io;
};

export default InitializeSocket;
