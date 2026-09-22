import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExercisePicker from "../components/ExercisePicker";
import OwnSessionExerciseCard, {
  type SessionExercise,
} from "../components/OwnSessionExerciseCard";
import type { SetTemplate } from "../lib/program";
import { EXERCISE_CATALOG, MUSCLE_GROUPS } from "../mock/exercises";
import "./training.css";

function defaultSet(measureType: "reps" | "time"): SetTemplate {
  return measureType === "time"
    ? { reps_min: null, reps_max: null, duration_seconds: 30 }
    : { reps_min: 10, reps_max: 10, duration_seconds: null };
}

function OwnSession() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<SessionExercise[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const addExercise = (name: string) => {
    setPickerOpen(false);

    if (exercises.some((e) => e.name === name)) return;

    const catalogEntry = EXERCISE_CATALOG.find((e) => e.name === name);
    const primaryMuscle = catalogEntry?.muscles.find(
      (m) => m.role === "primary",
    )?.muscle;
    const muscleGroup =
      MUSCLE_GROUPS.find((g) => g.muscles.includes(primaryMuscle ?? ""))
        ?.name ?? "";
    const measureType = catalogEntry?.measure_type ?? "reps";

    setExercises((prev) => [
      ...prev,
      {
        name,
        muscleGroup,
        measureType,
        sets: [
          defaultSet(measureType),
          defaultSet(measureType),
          defaultSet(measureType),
        ],
      },
    ]);
  };

  const updateSets = (name: string, sets: SetTemplate[]) => {
    setExercises((prev) =>
      prev.map((e) => (e.name === name ? { ...e, sets } : e)),
    );
  };

  const removeExercise = (name: string) => {
    setExercises((prev) => prev.filter((e) => e.name !== name));
  };

  return (
    <main>
      <h1>Skapa ditt eget pass</h1>

      {exercises.map((exercise) => (
        <OwnSessionExerciseCard
          key={exercise.name}
          exercise={exercise}
          onChange={(sets) => updateSets(exercise.name, sets)}
          onRemove={() => removeExercise(exercise.name)}
        />
      ))}

      <button
        type="button"
        className="add-exercise"
        onClick={() => setPickerOpen(true)}
      >
        <span className="add-exercise-icon">+</span>
        <span>
          Lägg till en övning
          <small>Välj muskelgrupp och muskel</small>
        </span>
      </button>

      {exercises.length > 0 && (
        <button
          type="button"
          className="btn-large"
          onClick={() => navigate("/traning/pass")}
        >
          Starta pass
        </button>
      )}

      {pickerOpen && (
        <ExercisePicker
          onPick={addExercise}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <Link to="/traning">← Tillbaka till Träning</Link>
    </main>
  );
}

export default OwnSession;
