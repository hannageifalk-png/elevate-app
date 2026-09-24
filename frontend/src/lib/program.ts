import { EXERCISE_CATALOG, MUSCLE_GROUPS } from "../mock/exercises";
import type { CatalogExercise } from "../mock/exercises";

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
