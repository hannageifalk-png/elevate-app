import { useState } from "react";
import { setsLabel } from "../lib/program";
import type { PassExercise, SetTemplate } from "../lib/program";
import "./OwnSessionExerciseCard.css";

export type SessionExercise = PassExercise;

type OwnSessionExerciseCardProps = {
  exercise: SessionExercise;
  onChange: (sets: SetTemplate[]) => void;
  onRemove: () => void;
};

function OwnSessionExerciseCard({
  exercise,
  onChange,
  onRemove,
}: OwnSessionExerciseCardProps) {
  const [editing, setEditing] = useState(false);
  const unit = exercise.measureType === "time" ? "sek" : "reps";

  const updateSet = (index: number, value: number) => {
    onChange(
      exercise.sets.map((set, i) =>
        i === index
          ? exercise.measureType === "time"
            ? { ...set, duration_seconds: value }
            : { ...set, reps_min: value, reps_max: value }
          : set,
      ),
    );
  };

  const addSet = () => {
    const last = exercise.sets[exercise.sets.length - 1];
    onChange([...exercise.sets, last]);
  };

  const removeSet = (index: number) => {
    onChange(exercise.sets.filter((_, i) => i !== index));
  };

  return (
    <section className="own-session-card">
      <div className="row row-between">
        <div>
          <p className="eyebrow">{exercise.muscleGroup}</p>
          <h3>{exercise.name}</h3>
        </div>
        <button
          type="button"
          className={editing ? "icon-button icon-button-confirm" : "icon-button"}
          aria-label={editing ? "Klar med redigering" : "Redigera set"}
          onClick={() => setEditing((value) => !value)}
        >
          {editing ? (
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4 10.5 4 4 8-9"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8.34 1.67h3.32l.5 2.06a6.4 6.4 0 0 1 1.6.93l2.02-.65 1.66 2.87-1.6 1.4c.05.32.08.65.08.98s-.03.66-.08.98l1.6 1.4-1.66 2.87-2.02-.65a6.4 6.4 0 0 1-1.6.93l-.5 2.06H8.34l-.5-2.06a6.4 6.4 0 0 1-1.6-.93l-2.02.65-1.66-2.87 1.6-1.4a6 6 0 0 1-.08-.98c0-.33.03-.66.08-.98l-1.6-1.4L4.22 3.6l2.02.65a6.4 6.4 0 0 1 1.6-.93zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
              />
            </svg>
          )}
        </button>
      </div>

      {editing ? (
        <>
          <div className="set-editor">
            {exercise.sets.map((set, i) => (
              <div className="set-editor-row" key={i}>
                <span>Set {i + 1}</span>
                <input
                  type="number"
                  min={0}
                  value={
                    exercise.measureType === "time"
                      ? (set.duration_seconds ?? 0)
                      : (set.reps_min ?? 0)
                  }
                  onChange={(e) => updateSet(i, Number(e.target.value))}
                />
                <span className="muted">{unit}</span>
                {exercise.sets.length > 1 && (
                  <button
                    type="button"
                    className="btn-quiet"
                    aria-label={`Ta bort set ${i + 1}`}
                    onClick={() => removeSet(i)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" className="btn-ghost" onClick={addSet}>
            + Lägg till ett set
          </button>

          <button type="button" className="btn-quiet" onClick={onRemove}>
            Ta bort övning
          </button>
        </>
      ) : (
        <p className="muted">{setsLabel(exercise.sets)}</p>
      )}
    </section>
  );
}

export default OwnSessionExerciseCard;
