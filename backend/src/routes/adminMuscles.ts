import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

export const adminMusclesRouter = Router();

adminMusclesRouter.get("/", async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from("muscle")
    .select("id, name, muscle_group")
    .order("muscle_group")
    .order("name");

  if (error) {
    res.status(500).json({
      success: false,
      error: "fetch_failed",
      message: "Kunde inte hämta muskler.",
    });
    return;
  }

  res.json({ success: true, muscles: data ?? [] });
});
