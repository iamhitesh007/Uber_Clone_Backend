import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import http from "http";
import mongoose from "mongoose";
import os from "os";
import InitializeSocket from "./socket.js";

function getIpAddress() {
  const networkInterfaces = os.networkInterfaces();

  for (let interfacesName in networkInterfaces) {
    let interFaces = networkInterfaces[interfacesName];
    for (let int of interFaces) {
      if (int.family === "IPv4" && !int.internal) {
        return int.address;
      }
    }
  }
  return "127.0.0.1";
}

getIpAddress();

const server = http.createServer(app);

export const io = InitializeSocket(server);

const PORT = process.env.PORT || 5000;

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

server.listen(PORT, async () => {
  console.log(`Server is running at http://${getIpAddress()}:${PORT}`);
  try {
    await connectDB();
  } catch (err) {
    console.error(err);
  }
});
