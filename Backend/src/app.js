import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import photosRouter, { uploadsDir } from "./routes/photos.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/health", healthRouter);
app.use("/api/uploads", express.static(uploadsDir));
app.use("/api/photos", photosRouter);

export default app;
