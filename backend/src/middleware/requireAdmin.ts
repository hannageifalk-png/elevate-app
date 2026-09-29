import type { NextFunction, Request, Response } from "express";
import { ADMIN_ROLE } from "../config/membership";
import { supabaseAdmin } from "../lib/supabaseAdmin";

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      error: "unauthorized",
      message: "Ingen giltig inloggning hittades.",
    });
    return;
  }

  const { data: profile, error } = await supabaseAdmin
    .from("app_user")
    .select("role")
    .eq("id", req.userId)
    .single();

  if (error || !profile || profile.role !== ADMIN_ROLE) {
    res.status(403).json({
      success: false,
      error: "forbidden",
      message: "Den här åtgärden kräver administratörsbehörighet.",
    });
    return;
  }

  next();
}
