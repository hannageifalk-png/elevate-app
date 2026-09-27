import "dotenv/config";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { requireAuth } from "./middleware/requireAuth";
import { purchaseRouter } from "./routes/purchase";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Elevate API is running",
  });
});

app.use("/api/purchase", requireAuth, purchaseRouter);

app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
});
