import { Router } from "express";
import { supabaseAdmin } from "../lib/supabaseAdmin";

const PROGRAM_TYPES = ["Allmänt program", "Styrkelyft specifikt", "Kroppsbyggande"];
const LEVELS = [0, 1, 2];

function parseSets(input: any) {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Minst ett set krävs per övning." };
  }

  const sets = [];

  for (const s of input) {
    const repsMin = s?.reps_min === "" || s?.reps_min == null ? null : Number(s.reps_min);
    const repsMax = s?.reps_max === "" || s?.reps_max == null ? null : Number(s.reps_max);
    const duration = s?.duration_seconds === "" || s?.duration_seconds == null ? null : Number(s.duration_seconds);
    const targetRpe = s?.target_rpe === "" || s?.target_rpe == null ? null : Number(s.target_rpe);

    if (repsMin === null && duration === null) {
      return { error: "Varje set behöver antingen reps eller sekunder." };
    }

    sets.push({ reps_min: repsMin, reps_max: repsMax, duration_seconds: duration, target_rpe: targetRpe });
  }

  return { sets };
}

function parseDays(input: any) {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "Minst en dag krävs." };
  }

  const days = [];

  for (const d of input) {
    const name = typeof d?.name === "string" ? d.name.trim() : "";
    if (!name) {
      return { error: "Varje dag behöver ett namn." };
    }

    const isRestDay = d?.is_rest_day === true;
    const exercisesInput = Array.isArray(d?.exercises) ? d.exercises : [];

    if (!isRestDay && exercisesInput.length === 0) {
      return { error: `Dagen "${name}" behöver minst en övning.` };
    }

    const exercises = [];

    for (const ex of exercisesInput) {
      if (typeof ex?.exercise_id !== "string" || !ex.exercise_id) {
        return { error: "Ogiltig övning i en dag." };
      }

      const restSeconds = Number.isInteger(Number(ex?.rest_seconds)) ? Number(ex.rest_seconds) : 90;
      const parsedSets = parseSets(ex?.sets);

      if ("error" in parsedSets) {
        return { error: parsedSets.error };
      }

      exercises.push({ exercise_id: ex.exercise_id, rest_seconds: restSeconds, sets: parsedSets.sets });
    }

    days.push({ name, is_rest_day: isRestDay, exercises });
  }

  return { days };
}

function parseProgramPayload(body: any) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return { error: "Namn krävs." };
  }

  if (!PROGRAM_TYPES.includes(body?.program_type)) {
    return { error: "Ogiltig programtyp." };
  }

  const appUserRole = Number(body?.app_user_role);
  if (!LEVELS.includes(appUserRole)) {
    return { error: "Ogiltig nivå." };
  }

  const sessionsPerWeek = Number(body?.recommended_sessions_per_week);
  if (!Number.isInteger(sessionsPerWeek) || sessionsPerWeek < 1) {
    return { error: "Ogiltigt antal pass per vecka." };
  }

  const parsedDays = parseDays(body?.days);
  if ("error" in parsedDays) {
    return { error: parsedDays.error };
  }

  return {
    fields: {
      name,
      description: typeof body?.description === "string" ? body.description.trim() : "",
      program_type: body.program_type,
      app_user_role: appUserRole,
      recommended_sessions_per_week: sessionsPerWeek,
      is_template: true,
      owner_user_id: null,
    },
    days: parsedDays.days,
  };
}

async function loadPrograms(programIds: string[]) {
  if (programIds.length === 0) return [];

  const { data: weeks } = await supabaseAdmin
    .from("program_week")
    .select("id, program_id, week_number")
    .in("program_id", programIds);

  const weekIds = (weeks ?? []).map((w) => w.id);

  const { data: days } =
    weekIds.length > 0
      ? await supabaseAdmin
          .from("program_day")
          .select("id, program_week_id, day_number, name, is_rest_day")
          .in("program_week_id", weekIds)
          .order("day_number")
      : { data: [] };

  const dayIds = (days ?? []).map((d) => d.id);

  const { data: slots } =
    dayIds.length > 0
      ? await supabaseAdmin
          .from("exercise_slot")
          .select("id, program_day_id, exercise_id, sort_order, rest_seconds, exercise(id, name)")
          .in("program_day_id", dayIds)
          .order("sort_order")
      : { data: [] };

  const slotIds = (slots ?? []).map((s) => s.id);

  const { data: sets } =
    slotIds.length > 0
      ? await supabaseAdmin
          .from("set_template")
          .select("id, exercise_slot_id, set_number, reps_min, reps_max, duration_seconds, target_rpe")
          .in("exercise_slot_id", slotIds)
          .order("set_number")
      : { data: [] };

  const { data: programs } = await supabaseAdmin
    .from("program")
    .select("id, name, description, app_user_role, recommended_sessions_per_week, program_type, created_at")
    .in("id", programIds);

  return (programs ?? []).map((program) => {
    const programWeeks = (weeks ?? []).filter((w) => w.program_id === program.id);
    const programDays = (days ?? []).filter((d) => programWeeks.some((w) => w.id === d.program_week_id));

    return {
      ...program,
      week_count: programWeeks.length,
      days: programDays.map((day) => {
        const daySlots = (slots ?? []).filter((s) => s.program_day_id === day.id);

        return {
          id: day.id,
          day_number: day.day_number,
          name: day.name,
          is_rest_day: day.is_rest_day,
          exercises: daySlots.map((slot: any) => ({
            id: slot.id,
            exercise_id: slot.exercise_id,
            exercise_name: slot.exercise?.name ?? "",
            sort_order: slot.sort_order,
            rest_seconds: slot.rest_seconds,
            sets: (sets ?? [])
              .filter((s) => s.exercise_slot_id === slot.id)
              .map((s) => ({
                set_number: s.set_number,
                reps_min: s.reps_min,
                reps_max: s.reps_max,
                duration_seconds: s.duration_seconds,
                target_rpe: s.target_rpe,
              })),
          })),
        };
      }),
    };
  });
}

async function insertProgramDays(programId: string, days: any[]) {
  const { data: week, error: weekError } = await supabaseAdmin
    .from("program_week")
    .insert({ program_id: programId, week_number: 1 })
    .select()
    .single();

  if (weekError || !week) {
    return { error: "Kunde inte skapa programveckan." };
  }

  for (let i = 0; i < days.length; i++) {
    const day = days[i];

    const { data: dayRow, error: dayError } = await supabaseAdmin
      .from("program_day")
      .insert({ program_week_id: week.id, day_number: i + 1, name: day.name, is_rest_day: day.is_rest_day })
      .select()
      .single();

    if (dayError || !dayRow) {
      return { error: "Kunde inte skapa en dag." };
    }

    for (let j = 0; j < day.exercises.length; j++) {
      const exercise = day.exercises[j];

      const { data: slot, error: slotError } = await supabaseAdmin
        .from("exercise_slot")
        .insert({
          program_day_id: dayRow.id,
          exercise_id: exercise.exercise_id,
          sort_order: j + 1,
          rest_seconds: exercise.rest_seconds,
        })
        .select()
        .single();

      if (slotError || !slot) {
        return { error: "Kunde inte spara en övning i programmet." };
      }

      const setsToInsert = exercise.sets.map((s: any, setIndex: number) => ({
        exercise_slot_id: slot.id,
        set_number: setIndex + 1,
        reps_min: s.reps_min,
        reps_max: s.reps_max,
        duration_seconds: s.duration_seconds,
        target_rpe: s.target_rpe,
      }));

      const { error: setsError } = await supabaseAdmin.from("set_template").insert(setsToInsert);

      if (setsError) {
        return { error: "Kunde inte spara set för en övning." };
      }
    }
  }

  return { error: null };
}

// Tar bort hela dag/övnings/set-trädet under ett program, barn-till-förälder eftersom
// inget i schemat har ON DELETE CASCADE. Om en rad redan är refererad från ett loggat
// pass (workout_session/session_exercise) slår Postgres tillbaka med en FK-konflikt,
// vilket vi läser av på error.code i anropande route.
async function deleteProgramTree(programId: string) {
  const { data: weeks } = await supabaseAdmin.from("program_week").select("id").eq("program_id", programId);
  const weekIds = (weeks ?? []).map((w) => w.id);

  if (weekIds.length === 0) {
    return { error: null };
  }

  const { data: days } = await supabaseAdmin.from("program_day").select("id").in("program_week_id", weekIds);
  const dayIds = (days ?? []).map((d) => d.id);

  if (dayIds.length > 0) {
    const { data: slots } = await supabaseAdmin.from("exercise_slot").select("id").in("program_day_id", dayIds);
    const slotIds = (slots ?? []).map((s) => s.id);

    if (slotIds.length > 0) {
      await supabaseAdmin.from("set_template").delete().in("exercise_slot_id", slotIds);

      const { error: slotError } = await supabaseAdmin.from("exercise_slot").delete().in("id", slotIds);
      if (slotError) return { error: slotError };
    }

    const { error: dayError } = await supabaseAdmin.from("program_day").delete().in("id", dayIds);
    if (dayError) return { error: dayError };
  }

  const { error: weekError } = await supabaseAdmin.from("program_week").delete().in("id", weekIds);
  if (weekError) return { error: weekError };

  return { error: null };
}

const HISTORY_MESSAGE =
  "Dagarna och övningarna går inte att ändra eftersom det redan finns loggade pass kopplade till dem. Skapa ett nytt program om strukturen behöver ändras.";

export const adminProgramsRouter = Router();

adminProgramsRouter.get("/", async (_req, res) => {
  const { data: programRows, error } = await supabaseAdmin
    .from("program")
    .select("id")
    .eq("is_template", true)
    .order("name");

  if (error) {
    res.status(500).json({ success: false, error: "fetch_failed", message: "Kunde inte hämta program." });
    return;
  }

  const programs = await loadPrograms((programRows ?? []).map((p) => p.id));
  programs.sort((a, b) => a.name.localeCompare(b.name, "sv"));

  res.json({ success: true, programs });
});

adminProgramsRouter.post("/", async (req, res) => {
  const parsed = parseProgramPayload(req.body);

  if ("error" in parsed) {
    res.status(400).json({ success: false, error: "invalid_payload", message: parsed.error });
    return;
  }

  const { data: program, error } = await supabaseAdmin.from("program").insert(parsed.fields).select().single();

  if (error || !program) {
    res.status(500).json({ success: false, error: "create_failed", message: "Kunde inte skapa programmet." });
    return;
  }

  const insertResult = await insertProgramDays(program.id, parsed.days);

  if (insertResult.error) {
    await deleteProgramTree(program.id);
    await supabaseAdmin.from("program").delete().eq("id", program.id);
    res.status(500).json({ success: false, error: "create_failed", message: insertResult.error });
    return;
  }

  const [full] = await loadPrograms([program.id]);
  res.status(201).json({ success: true, program: full });
});

adminProgramsRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const parsed = parseProgramPayload(req.body);

  if ("error" in parsed) {
    res.status(400).json({ success: false, error: "invalid_payload", message: parsed.error });
    return;
  }

  const { data: existing } = await supabaseAdmin.from("program").select("id").eq("id", id).single();

  if (!existing) {
    res.status(404).json({ success: false, error: "not_found", message: "Programmet hittades inte." });
    return;
  }

  const { error: updateError } = await supabaseAdmin.from("program").update(parsed.fields).eq("id", id);

  if (updateError) {
    res.status(500).json({ success: false, error: "update_failed", message: "Kunde inte uppdatera programmet." });
    return;
  }

  const treeResult = await deleteProgramTree(id);

  if (treeResult.error) {
    if (treeResult.error.code === "23503") {
      res.status(409).json({ success: false, error: "has_history", message: HISTORY_MESSAGE });
      return;
    }

    res.status(500).json({
      success: false,
      error: "update_failed",
      message: "Kunde inte uppdatera programmets dagar.",
    });
    return;
  }

  const insertResult = await insertProgramDays(id, parsed.days);

  if (insertResult.error) {
    res.status(500).json({ success: false, error: "update_failed", message: insertResult.error });
    return;
  }

  const [full] = await loadPrograms([id]);
  res.json({ success: true, program: full });
});

adminProgramsRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const treeResult = await deleteProgramTree(id);

  if (treeResult.error) {
    if (treeResult.error.code === "23503") {
      res.status(409).json({
        success: false,
        error: "has_history",
        message: "Programmet går inte att ta bort eftersom det redan finns loggade pass kopplade till det.",
      });
      return;
    }

    res.status(500).json({ success: false, error: "delete_failed", message: "Kunde inte ta bort programmet." });
    return;
  }

  const { error: programError } = await supabaseAdmin.from("program").delete().eq("id", id);

  if (programError) {
    res.status(500).json({ success: false, error: "delete_failed", message: "Kunde inte ta bort programmet." });
    return;
  }

  res.json({ success: true });
});
