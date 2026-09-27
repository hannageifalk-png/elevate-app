import { randomUUID } from "node:crypto";
import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const PURCHASABLE_TIERS: number[] = [1, 2];

export const purchaseRouter = Router();

purchaseRouter.post("/", async (req, res) => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      error: "unauthorized",
      message: "Ingen giltig inloggning hittades.",
    });
    return;
  }

  const userId = req.userId;
  const tier = Number(req.body?.tier);

  if (!Number.isInteger(tier)) {
    res.status(400).json({
      success: false,
      error: "invalid_tier",
      message: "Ogiltig medlemsnivå.",
    });
    return;
  }

  if (!PURCHASABLE_TIERS.includes(tier)) {
    res.status(400).json({
      success: false,
      error: "invalid_tier",
      message: "Ogiltig medlemsnivå.",
    });
    return;
  }

  const { data: plan, error: planError } = await supabaseAdmin
    .from("membership_plan")
    .select("name, price")
    .eq("level", tier)
    .single();

  if (planError || !plan) {
    res.status(400).json({
      success: false,
      error: "invalid_tier",
      message: "Ogiltig medlemsnivå.",
    });
    return;
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("app_user")
    .select("role")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    res.status(500).json({
      success: false,
      error: "purchase_failed",
      message: "Din profil kunde inte hittas.",
    });
    return;
  }

  if (tier <= profile.role) {
    res.status(400).json({
      success: false,
      error: "not_an_upgrade",
      message: "Du kan endast uppgradera till en högre medlemsnivå.",
    });
    return;
  }

  const transactionId = randomUUID();

  const { data: purchase, error: purchaseError } = await supabaseAdmin
    .from("purchase")
    .insert({
      user_id: userId,
      tier,
      product_name: plan.name,
      price: plan.price,
      currency: "SEK",
      provider: "mock",
      provider_transaction_id: transactionId,
    })
    .select("purchased_at")
    .single();

  if (purchaseError || !purchase) {
    res.status(500).json({
      success: false,
      error: "purchase_failed",
      message: "Betalningen kunde inte genomföras.",
    });
    return;
  }

  const { error: updateError } = await supabaseAdmin
    .from("app_user")
    .update({ role: tier })
    .eq("id", userId);

  if (updateError) {
    res.status(500).json({
      success: false,
      error: "role_update_failed",
      message: "Betalningen genomfördes, men medlemskapet kunde inte uppdateras.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    purchase: {
      transactionId,
      tier,
      purchasedAt: purchase.purchased_at,
    },
    profile: { role: tier },
  });
});
