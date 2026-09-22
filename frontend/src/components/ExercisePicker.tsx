import { useState } from "react";
import { EXERCISE_CATALOG, MUSCLE_GROUPS } from "../mock/exercises";
import "./ExercisePicker.css";

type ExercisePickerProps = {
  onPick: (exerciseName: string) => void;
  onClose: () => void;
};

function ExercisePicker({ onPick, onClose }: ExercisePickerProps) {
  const [group, setGroup] = useState<string | null>(null);
  const [muscle, setMuscle] = useState<string | null>(null);
  const [primaryOnly, setPrimaryOnly] = useState(true);

  const muscles = MUSCLE_GROUPS.find((g) => g.name === group)?.muscles ?? [];

  const matches = muscle
    ? EXERCISE_CATALOG.filter((exercise) =>
        exercise.muscles.some(
          (m) => m.muscle === muscle && (!primaryOnly || m.role === "primary"),
        ),
      )
    : [];

  const chooseGroup = (next: string) => {
    setGroup(next);
    setMuscle(null);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog" role="dialog" aria-modal="true" aria-label="Lägg till en övning">
        <h2>Lägg till en övning</h2>

        <div>
          <p className="eyebrow">Muskelgrupp</p>
          <div className="picker-choices">
            {MUSCLE_GROUPS.map((g) => (
              <button
                key={g.name}
                type="button"
                className={group === g.name ? "" : "btn-ghost"}
                onClick={() => chooseGroup(g.name)}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {group && (
          <div>
            <p className="eyebrow">Muskel</p>
            <div className="picker-choices">
              {muscles.map((m) => (
                <button
                  key={m}
                  type="button"
                  className={muscle === m ? "" : "btn-ghost"}
                  onClick={() => setMuscle(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {muscle && (
          <>
            <label className="picker-checkbox">
              <input
                type="checkbox"
                checked={primaryOnly}
                onChange={(e) => setPrimaryOnly(e.target.checked)}
              />
              Visa endast övningar som primärt träffar {muscle}.
            </label>

            <ul className="picker-results">
              {matches.map((exercise) => (
                <li key={exercise.id}>
                  <button type="button" onClick={() => onPick(exercise.name)}>
                    {exercise.name}
                  </button>
                </li>
              ))}
              {matches.length === 0 && (
                <p className="muted">Inga övningar hittades.</p>
              )}
            </ul>
          </>
        )}

        <button type="button" className="btn-quiet" onClick={onClose}>
          Avbryt
        </button>
      </div>
    </div>
  );
}

export default ExercisePicker;
