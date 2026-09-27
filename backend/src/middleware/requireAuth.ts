import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      error: "unauthorized",
      message: "Ingen giltig inloggning hittades.",
    });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    res.status(401).json({
      success: false,
      error: "unauthorized",
      message: "Ingen giltig inloggning hittades.",
    });
    return;
  }

  req.userId = data.user.id;
  next();
}
