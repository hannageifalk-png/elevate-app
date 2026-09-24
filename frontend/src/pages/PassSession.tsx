import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { PassExercise } from "../lib/program";
import {
  describeExercise,
  findEquivalentExercises,
  movementPatternLabel,
  setsLabel,
} from "../lib/program";
import "./training.css";
import "./PassSession.css";

type PassState = {
  sessionName: string;
  exercises: PassExercise[];
};

type LoggedSet = {
  weight: string;
  value: string;
  completed: boolean;
};

function isPassState(value: unknown): value is PassState {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<PassState>;
  return (
    typeof candidate.sessionName === "string" &&
    Array.isArray(candidate.exercises)
  );
}

function initialLog(exercises: PassExercise[]): Record<string, LoggedSet[]> {
  return Object.fromEntries(
    exercises.map((exercise) => [
      exercise.name,
      exercise.sets.map((set) => ({
        weight: "",
        value: String(set.duration_seconds ?? set.reps_max ?? set.reps_min ?? ""),
        completed: false,
      })),
    ]),
  );
}

function PassSession() {
  const location = useLocation();
  const navigate = useNavigate();
  const passState = isPassState(location.state) ? location.state : null;

  const [exercises, setExercises] = useState<PassExercise[]>(
    () => passState?.exercises ?? [],
  );
  const [logged, setLogged] = useState<Record<string, LoggedSet[]>>(() =>
    passState ? initialLog(passState.exercises) : {},
  );
  const [finished, setFinished] = useState(false);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);

  if (!passState) {
    return (
      <main>
        <h1>Ditt pass</h1>
        <section>
          <p>Inget pass valt. Starta ett pass från Träning-sidan.</p>
        </section>
        <Link to="/traning">← Tillbaka till Träning</Link>
      </main>
    );
  }

  const updateSet = (
    exerciseName: string,
    index: number,
    field: "weight" | "value",
    value: string,
  ) => {
    setLogged((prev) => ({
      ...prev,
      [exerciseName]: prev[exerciseName].map((set, i) =>
        i === index ? { ...set, [field]: value } : set,
      ),
    }));
  };

  const toggleSet = (exerciseName: string, index: number) => {
    setLogged((prev) => ({
      ...prev,
      [exerciseName]: prev[exerciseName].map((set, i) =>
        i === index ? { ...set, completed: !set.completed } : set,
      ),
    }));
  };

  const performSwap = (oldName: string, newName: string) => {
    const { muscleGroup, measureType } = describeExercise(newName);

    setExercises((prev) =>
      prev.map((exercise) =>
        exercise.name === oldName
          ? { ...exercise, name: newName, muscleGroup, measureType }
          : exercise,
      ),
    );

    setLogged((prev) => {
      const { [oldName]: oldSets, ...rest } = prev;
      return {
        ...rest,
        [newName]: oldSets.map((set) => ({
          ...set,
          weight: "",
          completed: false,
        })),
      };
    });

    setSwapTarget(null);
  };

  const doneExerciseCount = exercises.filter((exercise) =>
    logged[exercise.name].every((set) => set.completed),
  ).length;

  const swapCandidates = swapTarget
    ? findEquivalentExercises(
        swapTarget,
        exercises.map((e) => e.name),
      )
    : [];

  return (
    <main>
      <h1>{passState.sessionName}</h1>
      <p className="muted">
        {doneExerciseCount} av {exercises.length} övningar klara
      </p>

      {exercises.map((exercise) => {
        const unitLabel = exercise.measureType === "time" ? "Sek" : "Reps";
        const exerciseDone = logged[exercise.name].every((s) => s.completed);

        return (
          <section
            key={exercise.name}
            className={exerciseDone ? "pass-exercise-done" : undefined}
          >
            <p className="eyebrow">{exercise.muscleGroup}</p>
            <div className="row row-between">
              <h3>{exercise.name}</h3>
              <div className="row">
                {exerciseDone && (
                  <span className="badge badge-highlight">Klar</span>
                )}
                <button
                  type="button"
                  className="icon-button"
                  aria-label={`Byt ut ${exercise.name} mot en likvärdig övning`}
                  disabled={exerciseDone}
                  onClick={() => setSwapTarget(exercise.name)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m18 14 4 4-4 4" />
                    <path d="m18 2 4 4-4 4" />
                    <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22" />
                    <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2" />
                    <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="muted">Mål: {setsLabel(exercise.sets)}</p>

            <div className="set-editor">
              <div className="set-editor-row set-editor-header muted">
                <span>Set</span>
                <span>Vikt (kg)</span>
                <span>{unitLabel}</span>
                <span>Klar</span>
              </div>

              {exercise.sets.map((_, i) => {
                const set = logged[exercise.name][i];

                return (
                  <div className="set-editor-row" key={i}>
                    <span>{i + 1}</span>
                    <input
                      type="number"
                      min={0}
                      placeholder="kg"
                      value={set.weight}
                      disabled={set.completed}
                      onChange={(e) =>
                        updateSet(exercise.name, i, "weight", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      value={set.value}
                      disabled={set.completed}
                      onChange={(e) =>
                        updateSet(exercise.name, i, "value", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className={set.completed ? "set-check set-check-done" : "set-check"}
                      aria-pressed={set.completed}
                      aria-label={
                        set.completed
                          ? `Set ${i + 1} klart`
                          : `Markera set ${i + 1} som klart`
                      }
                      onClick={() => toggleSet(exercise.name, i)}
                    >
                      {set.completed && (
                        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4 10.5 4 4 8-9"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <button type="button" className="btn-large" onClick={() => setFinished(true)}>
        Avsluta pass
      </button>

      <Link to="/traning">← Tillbaka till Träning</Link>

      {finished && (
        <div className="dialog-overlay">
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Passet är loggat"
          >
            <h2>Bra jobbat!</h2>
            <p>Passet är avslutat.</p>
            <button type="button" autoFocus onClick={() => navigate("/traning")}>
              Till Träning
            </button>
          </div>
        </div>
      )}

      {swapTarget && (
        <div className="dialog-overlay">
          <div
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Byt ut ${swapTarget}`}
          >
            <h2>Byt ut {swapTarget}</h2>
            <p className="muted">
              {movementPatternLabel(swapTarget) &&
                `${movementPatternLabel(swapTarget)} · `}
              Samma mål (set och reps) följer med, bara övningen byts.
            </p>

            <ul className="picker-results">
              {swapCandidates.map((candidate) => (
                <li key={candidate.id}>
                  <button
                    type="button"
                    className="swap-candidate"
                    onClick={() => performSwap(swapTarget, candidate.name)}
                  >
                    <span>{candidate.name}</span>
                    <span className="muted">
                      {movementPatternLabel(candidate.name)}
                    </span>
                  </button>
                </li>
              ))}
              {swapCandidates.length === 0 && (
                <p className="muted">Inga likvärdiga övningar hittades.</p>
              )}
            </ul>

            <button
              type="button"
              className="btn-quiet"
              onClick={() => setSwapTarget(null)}
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default PassSession;
