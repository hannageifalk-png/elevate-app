import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const MOVEMENT_PATTERNS = ["squat", "hinge", "push", "pull_vertical", "pull_horizontal", "isolation"];
const EQUIPMENT_OPTIONS = ["barbell", "dumbbell", "cable", "machine", "bodyweight"];
const MEASURE_TYPES = ["reps", "time"];
const MUSCLE_ROLES = ["primary", "secondary"];

const EXERCISE_SELECT = "*, exercise_muscle(muscle_id, role, muscle(id, name, muscle_group))";

function parsePayload(body: any) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return { error: "Namn krävs." };
  }

  if (!MOVEMENT_PATTERNS.includes(body?.movement_pattern)) {
    return { error: "Ogiltigt rörelsemönster." };
  }

  if (!EQUIPMENT_OPTIONS.includes(body?.equipment)) {
    return { error: "Ogiltig utrustning." };
  }

  if (!MEASURE_TYPES.includes(body?.measure_type)) {
    return { error: "Ogiltig måttyp." };
  }

  const musclesInput = Array.isArray(body?.muscles) ? body.muscles : [];
  const muscles = [];
  const seenMuscleIds = new Set();

  for (const entry of musclesInput) {
    const muscleId = Number(entry?.muscle_id);

    if (!Number.isInteger(muscleId) || !MUSCLE_ROLES.includes(entry?.role)) {
      return { error: "Ogiltig muskelkoppling." };
    }

    if (seenMuscleIds.has(muscleId)) {
      return { error: "Samma muskel är kopplad flera gånger." };
    }

    seenMuscleIds.add(muscleId);
    muscles.push({ muscle_id: muscleId, role: entry.role });
  }

  return {
    fields: {
      name,
      movement_pattern: body.movement_pattern,
      equipment: body.equipment,
      measure_type: body.measure_type,
      description: typeof body?.description === "string" ? body.description : "",
      is_archived: body?.is_archived === true,
    },
    muscles,
  };
}

function normalizeExercise(row: any) {
  const { exercise_muscle, ...rest } = row;
  const links = exercise_muscle ?? [];

  return {
    ...rest,
    muscles: links.map((link: any) => ({
      muscle_id: link.muscle_id,
      role: link.role,
      name: link.muscle?.name ?? "",
      muscle_group: link.muscle?.muscle_group ?? null,
    })),
  };
}

export const adminExercisesRouter = Router();

adminExercisesRouter.get("/", async (_req, res) => {
  const { data, error } = await supabaseAdmin.from("exercise").select(EXERCISE_SELECT).order("name");

  if (error) {
    res.status(500).json({ success: false, error: "fetch_failed", message: "Kunde inte hämta övningar." });
    return;
  }

  res.json({ success: true, exercises: (data ?? []).map(normalizeExercise) });
});

adminExercisesRouter.post("/", async (req, res) => {
  const parsed = parsePayload(req.body);

  if ("error" in parsed) {
    res.status(400).json({ success: false, error: "invalid_payload", message: parsed.error });
    return;
  }

  const { data: exercise, error } = await supabaseAdmin
    .from("exercise")
    .insert({ ...parsed.fields, created_by_user_id: null })
    .select()
    .single();

  if (error || !exercise) {
    res.status(500).json({ success: false, error: "create_failed", message: "Kunde inte skapa övningen." });
    return;
  }

  if (parsed.muscles.length > 0) {
    const { error: muscleError } = await supabaseAdmin
      .from("exercise_muscle")
      .insert(parsed.muscles.map((m) => ({ exercise_id: exercise.id, muscle_id: m.muscle_id, role: m.role })));

    if (muscleError) {
      // Övningen skapades men muskelkopplingarna gick inte att spara - städa upp
      // så vi inte lämnar kvar en övning utan sina muskler.
      await supabaseAdmin.from("exercise").delete().eq("id", exercise.id);
      res.status(500).json({
        success: false,
        error: "create_failed",
        message: "Kunde inte spara muskelkopplingarna.",
      });
      return;
    }
  }

  const { data: full } = await supabaseAdmin
    .from("exercise")
    .select(EXERCISE_SELECT)
    .eq("id", exercise.id)
    .single();

  res.status(201).json({ success: true, exercise: normalizeExercise(full ?? exercise) });
});

adminExercisesRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const parsed = parsePayload(req.body);

  if ("error" in parsed) {
    res.status(400).json({ success: false, error: "invalid_payload", message: parsed.error });
    return;
  }

  const { data: existing } = await supabaseAdmin.from("exercise").select("id").eq("id", id).single();

  if (!existing) {
    res.status(404).json({ success: false, error: "not_found", message: "Övningen hittades inte." });
    return;
  }

  const { error: updateError } = await supabaseAdmin.from("exercise").update(parsed.fields).eq("id", id);

  if (updateError) {
    res.status(500).json({ success: false, error: "update_failed", message: "Kunde inte uppdatera övningen." });
    return;
  }

  // Enklast att ersätta alla muskelkopplingar istället för att räkna ut diffen.
  await supabaseAdmin.from("exercise_muscle").delete().eq("exercise_id", id);

  if (parsed.muscles.length > 0) {
    const { error: insertError } = await supabaseAdmin
      .from("exercise_muscle")
      .insert(parsed.muscles.map((m) => ({ exercise_id: id, muscle_id: m.muscle_id, role: m.role })));

    if (insertError) {
      res.status(500).json({
        success: false,
        error: "update_failed",
        message: "Kunde inte spara muskelkopplingarna.",
      });
      return;
    }
  }

  const { data: full } = await supabaseAdmin.from("exercise").select(EXERCISE_SELECT).eq("id", id).single();

  res.json({ success: true, exercise: normalizeExercise(full) });
});

adminExercisesRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("exercise")
    .update({ is_archived: true })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ success: false, error: "not_found", message: "Övningen hittades inte." });
    return;
  }

  res.json({ success: true });
});
