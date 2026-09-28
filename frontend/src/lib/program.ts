import { EXERCISE_CATALOG, MUSCLE_GROUPS } from "../mock/exercises";
import type { CatalogExercise } from "../mock/exercises";
import { supabase } from "./supabase";

export type SetTemplate = {
  reps_min: number | null;
  reps_max: number | null;
  duration_seconds: number | null;
};

export type PassExercise = {
  name: string;
  muscleGroup: string;
  measureType: "reps" | "time";
  sets: SetTemplate[];
};

export type ProgramOverview = {
  id: string;
  name: string;
  description: string;
  app_user_role: number;
  recommended_sessions_per_week: number;
  program_type: string;
  week_count: number;
  exercise_count: number;
  equipment_label: string;
};

export type ScheduleDay = {
  id: string;
  name: string;
  exercises: { name: string; sets: SetTemplate[] }[];
};

export async function fetchProgramSchedule(
  programId: string,
): Promise<ScheduleDay[]> {
  const { data: weeks } = await supabase
    .from("program_week")
    .select("id, week_number")
    .eq("program_id", programId)
    .order("week_number");

  const weekIds = (weeks ?? []).map((week) => week.id);
  const weekNumberById = new Map(
    (weeks ?? []).map((week) => [week.id, week.week_number]),
  );

  const { data: days } = await supabase
    .from("program_day")
    .select("id, program_week_id, day_number, name, is_rest_day")
    .in("program_week_id", weekIds);

  const sortedDays = (days ?? []).slice().sort((a, b) => {
    const weekDiff =
      (weekNumberById.get(a.program_week_id) ?? 0) -
      (weekNumberById.get(b.program_week_id) ?? 0);
    return weekDiff !== 0 ? weekDiff : a.day_number - b.day_number;
  });

  const dayIds = sortedDays.map((day) => day.id);

  const { data: slots } = await supabase
    .from("exercise_slot")
    .select("id, program_day_id, exercise_id, sort_order")
    .in("program_day_id", dayIds)
    .order("sort_order");

  const exerciseIds = (slots ?? []).map((slot) => slot.exercise_id);

  const { data: exercises } = await supabase
    .from("exercise")
    .select("id, name")
    .in("id", exerciseIds);

  const slotIds = (slots ?? []).map((slot) => slot.id);

  const { data: sets } = await supabase
    .from("set_template")
    .select("id, exercise_slot_id, set_number, reps_min, reps_max, duration_seconds")
    .in("exercise_slot_id", slotIds)
    .order("set_number");

  const trainingDays = sortedDays.filter((day) => !day.is_rest_day);

  return trainingDays.map((day) => {
    const daySlots = (slots ?? []).filter(
      (slot) => slot.program_day_id === day.id,
    );

    const dayExercises = daySlots.map((slot) => {
      const exercise = (exercises ?? []).find((e) => e.id === slot.exercise_id);
      const exerciseSets = (sets ?? [])
        .filter((set) => set.exercise_slot_id === slot.id)
        .map((set) => ({
          reps_min: set.reps_min,
          reps_max: set.reps_max,
          duration_seconds: set.duration_seconds,
        }));

      return {
        name: exercise?.name ?? "Okänd övning",
        sets: exerciseSets,
      };
    });

    return { id: day.id, name: day.name, exercises: dayExercises };
  });
}

export async function countSessionsSinceStart(
  userId: string,
  dayIds: string[],
  startedAt: string,
): Promise<number> {
  if (dayIds.length === 0) return 0;

  const { data } = await supabase
    .from("workout_session")
    .select("id")
    .eq("user_id", userId)
    .in("program_day_id", dayIds)
    .gte("performed_at", startedAt);

  return (data ?? []).length;
}

export type ProgramProgress = {
  dayCount: number;
  finished: boolean;
  nextDay: ScheduleDay | null;
};

export function computeProgramProgress(
  schedule: ScheduleDay[],
  sessionsSinceStart: number,
): ProgramProgress {
  const dayCount = schedule.length;

  if (dayCount === 0) {
    return { dayCount: 0, finished: false, nextDay: null };
  }

  const finished = sessionsSinceStart >= dayCount;

  return {
    dayCount,
    finished,
    nextDay: finished ? null : schedule[sessionsSinceStart % dayCount],
  };
}

export function dayToPassExercises(
  exercises: { name: string; sets: SetTemplate[] }[],
): PassExercise[] {
  return exercises.map((exercise) => {
    const catalogEntry = EXERCISE_CATALOG.find(
      (e) => e.name === exercise.name,
    );
    const primaryMuscle = catalogEntry?.muscles.find(
      (m) => m.role === "primary",
    )?.muscle;
    const muscleGroup =
      MUSCLE_GROUPS.find((g) => g.muscles.includes(primaryMuscle ?? ""))
        ?.name ?? "";

    return {
      name: exercise.name,
      muscleGroup,
      measureType:
        catalogEntry?.measure_type ??
        (exercise.sets.some((s) => s.duration_seconds !== null)
          ? "time"
          : "reps"),
      sets: exercise.sets,
    };
  });
}

export function describeExercise(
  name: string,
): { muscleGroup: string; measureType: "reps" | "time" } {
  const catalogEntry = EXERCISE_CATALOG.find((e) => e.name === name);
  const primaryMuscle = catalogEntry?.muscles.find(
    (m) => m.role === "primary",
  )?.muscle;
  const muscleGroup =
    MUSCLE_GROUPS.find((g) => g.muscles.includes(primaryMuscle ?? ""))
      ?.name ?? "";

  return {
    muscleGroup,
    measureType: catalogEntry?.measure_type ?? "reps",
  };
}

function primaryMuscleGroupOf(exercise: CatalogExercise): string {
  const muscle = exercise.muscles.find((m) => m.role === "primary")?.muscle;
  return MUSCLE_GROUPS.find((g) => g.muscles.includes(muscle ?? ""))?.name ?? "";
}

export function findEquivalentExercises(
  exerciseName: string,
  exclude: string[],
): CatalogExercise[] {
  const current = EXERCISE_CATALOG.find((e) => e.name === exerciseName);
  const primaryMuscle = current?.muscles.find(
    (m) => m.role === "primary",
  )?.muscle;
  if (!primaryMuscle) return [];

  const candidates = EXERCISE_CATALOG.filter(
    (e) =>
      e.name !== exerciseName &&
      !exclude.includes(e.name) &&
      e.muscles.some(
        (m) => m.muscle === primaryMuscle && m.role === "primary",
      ),
  );

  return candidates.sort((a, b) => {
    const aSamePattern = a.movement_pattern === current?.movement_pattern;
    const bSamePattern = b.movement_pattern === current?.movement_pattern;
    if (aSamePattern !== bSamePattern) return aSamePattern ? -1 : 1;

    const groupCompare = primaryMuscleGroupOf(a).localeCompare(
      primaryMuscleGroupOf(b),
      "sv",
    );
    if (groupCompare !== 0) return groupCompare;

    return a.name.localeCompare(b.name, "sv");
  });
}

const MOVEMENT_PATTERN_LABELS: Record<string, string> = {
  push: "Push",
  pull_horizontal: "Pull (horisontell)",
  pull_vertical: "Pull (vertikal)",
  squat: "Squat",
  hinge: "Hinge",
  isolation: "Isolation",
};

export function movementPatternLabel(exerciseName: string): string | null {
  const entry = EXERCISE_CATALOG.find((e) => e.name === exerciseName);
  if (!entry) return null;

  return MOVEMENT_PATTERN_LABELS[entry.movement_pattern] ?? entry.movement_pattern;
}

export function lengthLabel(weekCount: number) {
  return weekCount <= 1 ? "Löpande" : `${weekCount} veckor`;
}

export function setsLabel(sets: SetTemplate[]) {
  if (sets.length === 0) return "";

  const labels = sets.map((set) => {
    if (set.duration_seconds !== null) return `${set.duration_seconds} s`;
    if (set.reps_min === set.reps_max) return `${set.reps_min}`;
    return `${set.reps_min}–${set.reps_max}`;
  });

  return labels.every((label) => label === labels[0])
    ? `${labels.length} × ${labels[0]}`
    : labels.join(" · ");
}
