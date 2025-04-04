// src/app.ts
import express from "express";
import cors from "cors";
import tipRoutes from "./routes/tipRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/tips", tipRoutes);

export { app };


