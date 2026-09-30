import "dotenv/config";
import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { requireAuth } from "./middleware/requireAuth";
import { requireAdmin } from "./middleware/requireAdmin";
import { purchaseRouter } from "./routes/purchase";
import { adminExercisesRouter } from "./routes/adminExercises";
import { adminMusclesRouter } from "./routes/adminMuscles";
import { adminProgramsRouter } from "./routes/adminPrograms";

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
app.use("/api/admin/exercises", requireAuth, requireAdmin, adminExercisesRouter);
app.use("/api/admin/muscles", requireAuth, requireAdmin, adminMusclesRouter);
app.use("/api/admin/programs", requireAuth, requireAdmin, adminProgramsRouter);

app.listen(env.port, () => {
  console.log(`Server is running on http://localhost:${env.port}`);
});
