import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filepath = path.resolve(__dirname, "public", "uploads");
import path from "path";

import userRouter from "./Routes/user.routes.js";
import captainRouter from "./Routes/captain.routes.js";
import mapsRouter from "./Routes/maps.routes.js";
import ridesRouter from "./Routes/rides.routes.js";
const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false, // disable CSP
  })
);

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..", "/frontend/dist")));

app.use("/public/uploads", express.static(filepath));

app.get("/api", (req, res, next) => {
  res.send("Hello World!");
  next();
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/captain", captainRouter);
app.use("/api/v1/maps", mapsRouter);
app.use("/api/v1/rides", ridesRouter);

app.use("/api/*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `can't find route ${req?.originalUrl} on this server..`,
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

export default app;
