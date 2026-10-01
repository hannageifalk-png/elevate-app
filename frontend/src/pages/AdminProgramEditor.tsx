import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch, getAccessToken } from "../lib/api";
import { MEMBERSHIP, MEMBERSHIP_NAMES } from "../constants/membership";
import AdminNav from "../components/AdminNav";
import "./AdminProgramEditor.css";

const PROGRAM_TYPES = ["Allmänt program", "Styrkelyft specifikt", "Kroppsbyggande"];
const LEVEL_OPTIONS = [MEMBERSHIP.FREE, MEMBERSHIP.STANDARD, MEMBERSHIP.PREMIUM];

type ExerciseOption = {
  id: string;
  name: string;
  measure_type: "reps" | "time";
  is_archived: boolean;
};

type ProgramRow = {
  id: string;
  name: string;
  description: string | null;
  program_type: string;
  app_user_role: number;
  recommended_sessions_per_week: number;
  days: {
    name: string;
    is_rest_day: boolean;
    exercises: {
      exercise_id: string;
      rest_seconds: number;
      sets: {
        reps_min: number | null;
        reps_max: number | null;
        duration_seconds: number | null;
        target_rpe: number | null;
      }[];
    }[];
  }[];
};

type SetForm = {
  reps_min: string;
  reps_max: string;
  duration_seconds: string;
  target_rpe: string;
};

type ExerciseSlotForm = {
  exercise_id: string;
  rest_seconds: string;
  sets: SetForm[];
};

type DayForm = {
  name: string;
  is_rest_day: boolean;
  exercises: ExerciseSlotForm[];
};

type ProgramFormState = {
  name: string;
  description: string;
  program_type: string;
  app_user_role: number;
  recommended_sessions_per_week: string;
  days: DayForm[];
};

const emptySet = (): SetForm => ({ reps_min: "10", reps_max: "10", duration_seconds: "", target_rpe: "" });

const emptyExercise = (exerciseId: string): ExerciseSlotForm => ({
  exercise_id: exerciseId,
  rest_seconds: "90",
  sets: [emptySet(), emptySet(), emptySet()],
});

const emptyProgram = (): ProgramFormState => ({
  name: "",
  description: "",
  program_type: PROGRAM_TYPES[0],
  app_user_role: MEMBERSHIP.STANDARD,
  recommended_sessions_per_week: "3",
  days: [],
});

function programToForm(program: ProgramRow): ProgramFormState {
  return {
    name: program.name,
    description: program.description ?? "",
    program_type: program.program_type,
    app_user_role: program.app_user_role,
    recommended_sessions_per_week: String(program.recommended_sessions_per_week),
    days: program.days.map((day) => ({
      name: day.name,
      is_rest_day: day.is_rest_day,
      exercises: day.exercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        rest_seconds: String(ex.rest_seconds),
        sets: ex.sets.map((s) => ({
          reps_min: s.reps_min === null ? "" : String(s.reps_min),
          reps_max: s.reps_max === null ? "" : String(s.reps_max),
          duration_seconds: s.duration_seconds === null ? "" : String(s.duration_seconds),
          target_rpe: s.target_rpe === null ? "" : String(s.target_rpe),
        })),
      })),
    })),
  };
}

function AdminProgramEditor() {
  const { programId } = useParams();
  const isEditing = Boolean(programId);
  const navigate = useNavigate();

  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [form, setForm] = useState<ProgramFormState>(emptyProgram());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const token = await getAccessToken();

    if (!token) {
      setLoadError("Ingen giltig inloggning hittades.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    const exercisesResult = await apiFetch("/api/admin/exercises", { token });

    if (!exercisesResult.success) {
      setLoadError(exercisesResult.message ?? "Kunde inte hämta övningar.");
      setLoading(false);
      return;
    }

    const exerciseOptions: ExerciseOption[] = exercisesResult.exercises;
    setExercises(exerciseOptions);

    if (isEditing) {
      const programsResult = await apiFetch("/api/admin/programs", { token });

      if (!programsResult.success) {
        setLoadError(programsResult.message ?? "Kunde inte hämta programmet.");
        setLoading(false);
        return;
      }

      const programRows: ProgramRow[] = programsResult.programs;
      const found = programRows.find((p) => p.id === programId);

      if (!found) {
        setLoadError("Programmet hittades inte.");
        setLoading(false);
        return;
      }

      setForm(programToForm(found));
    }

    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
  }, [programId]);

  const addDay = () => {
    setForm((prev) => ({ ...prev, days: [...prev.days, { name: "", is_rest_day: false, exercises: [] }] }));
  };

  const removeDay = (dayIndex: number) => {
    setForm((prev) => ({ ...prev, days: prev.days.filter((_, i) => i !== dayIndex) }));
  };

  const updateDay = (dayIndex: number, patch: Partial<DayForm>) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((day, i) => (i === dayIndex ? { ...day, ...patch } : day)),
    }));
  };

  const addExercise = (dayIndex: number) => {
    const defaultExerciseId = exercises.find((e) => !e.is_archived)?.id ?? exercises[0]?.id ?? "";

    setForm((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex ? { ...day, exercises: [...day.exercises, emptyExercise(defaultExerciseId)] } : day
      ),
    }));
  };

  const removeExercise = (dayIndex: number, exerciseIndex: number) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex ? { ...day, exercises: day.exercises.filter((_, j) => j !== exerciseIndex) } : day
      ),
    }));
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, patch: Partial<ExerciseSlotForm>) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? { ...day, exercises: day.exercises.map((ex, j) => (j === exerciseIndex ? { ...ex, ...patch } : ex)) }
          : day
      ),
    }));
  };

  const addSet = (dayIndex: number, exerciseIndex: number) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex, j) =>
                j === exerciseIndex ? { ...ex, sets: [...ex.sets, emptySet()] } : ex
              ),
            }
          : day
      ),
    }));
  };

  const removeSet = (dayIndex: number, exerciseIndex: number, setIndex: number) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex, j) =>
                j === exerciseIndex ? { ...ex, sets: ex.sets.filter((_, k) => k !== setIndex) } : ex
              ),
            }
          : day
      ),
    }));
  };

  const updateSet = (dayIndex: number, exerciseIndex: number, setIndex: number, patch: Partial<SetForm>) => {
    setForm((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === dayIndex
          ? {
              ...day,
              exercises: day.exercises.map((ex, j) =>
                j === exerciseIndex
                  ? { ...ex, sets: ex.sets.map((s, k) => (k === setIndex ? { ...s, ...patch } : s)) }
                  : ex
              ),
            }
          : day
      ),
    }));
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    program_type: form.program_type,
    app_user_role: form.app_user_role,
    recommended_sessions_per_week: Number(form.recommended_sessions_per_week),
    days: form.days.map((day) => ({
      name: day.name.trim(),
      is_rest_day: day.is_rest_day,
      exercises: day.is_rest_day
        ? []
        : day.exercises.map((ex) => ({
            exercise_id: ex.exercise_id,
            rest_seconds: Number(ex.rest_seconds) || 90,
            sets: ex.sets.map((s) => ({
              reps_min: s.reps_min === "" ? null : Number(s.reps_min),
              reps_max: s.reps_max === "" ? null : Number(s.reps_max),
              duration_seconds: s.duration_seconds === "" ? null : Number(s.duration_seconds),
              target_rpe: s.target_rpe === "" ? null : Number(s.target_rpe),
            })),
          })),
    })),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError("Namn krävs.");
      return;
    }

    if (form.days.length === 0) {
      setFormError("Lägg till minst en dag.");
      return;
    }

    setSaving(true);
    setFormError("");

    const token = await getAccessToken();
    if (!token) {
      setFormError("Ingen giltig inloggning hittades.");
      setSaving(false);
      return;
    }

    const payload = buildPayload();

    const result = isEditing
      ? await apiFetch(`/api/admin/programs/${programId}`, { method: "PUT", token, body: payload })
      : await apiFetch("/api/admin/programs", { method: "POST", token, body: payload });

    setSaving(false);

    if (!result.success) {
      setFormError(result.message ?? "Något gick fel.");
      return;
    }

    navigate("/admin/programs");
  };

  if (loading) {
    return (
      <main>
        <AdminNav />
        <p className="eyebrow">Admin</p>
        <h1>{isEditing ? "Redigera program" : "Nytt program"}</h1>
        <p className="muted">Laddar...</p>
      </main>
    );
  }

  return (
    <main>
      <AdminNav />

      <div>
        <p className="eyebrow">Admin</p>
        <h1>{isEditing ? "Redigera program" : "Nytt program"}</h1>
      </div>

      {loadError && <p className="error">{loadError}</p>}

      <form onSubmit={handleSubmit} className="stack">
        <section className="card">
          <label>
            Namn
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </label>

          <label>
            Beskrivning
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </label>

          <label>
            Programtyp
            <select
              value={form.program_type}
              onChange={(e) => setForm((prev) => ({ ...prev, program_type: e.target.value }))}
            >
              {PROGRAM_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nivå som krävs
            <select
              value={form.app_user_role}
              onChange={(e) => setForm((prev) => ({ ...prev, app_user_role: Number(e.target.value) }))}
            >
              {LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {MEMBERSHIP_NAMES[level]}
                </option>
              ))}
            </select>
          </label>

          <label>
            Rekommenderade pass/vecka
            <input
              type="number"
              min={1}
              value={form.recommended_sessions_per_week}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, recommended_sessions_per_week: e.target.value }))
              }
              required
            />
          </label>
        </section>

        <div className="stack">
          {form.days.map((day, dayIndex) => (
            <section className="card program-editor-day" key={dayIndex}>
              <div className="row row-between">
                <p className="eyebrow">Dag {dayIndex + 1}</p>
                <button type="button" className="btn-quiet" onClick={() => removeDay(dayIndex)}>
                  Ta bort dag
                </button>
              </div>

              <label>
                Namn
                <input
                  type="text"
                  value={day.name}
                  onChange={(e) => updateDay(dayIndex, { name: e.target.value })}
                  required
                />
              </label>

              <label className="picker-checkbox">
                <input
                  type="checkbox"
                  checked={day.is_rest_day}
                  onChange={(e) => updateDay(dayIndex, { is_rest_day: e.target.checked })}
                />
                Vilodag
              </label>

              {!day.is_rest_day && (
                <div className="stack">
                  {day.exercises.map((exercise, exerciseIndex) => {
                    const selectedExercise = exercises.find((e) => e.id === exercise.exercise_id);
                    const isTimeBased = selectedExercise?.measure_type === "time";

                    return (
                      <div className="program-editor-exercise" key={exerciseIndex}>
                        <div className="row row-between">
                          <select
                            value={exercise.exercise_id}
                            onChange={(e) =>
                              updateExercise(dayIndex, exerciseIndex, { exercise_id: e.target.value })
                            }
                          >
                            {exercises.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.name}
                                {option.is_archived ? " (arkiverad)" : ""}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="btn-quiet"
                            onClick={() => removeExercise(dayIndex, exerciseIndex)}
                          >
                            Ta bort
                          </button>
                        </div>

                        <label>
                          Vila (sekunder)
                          <input
                            type="number"
                            min={0}
                            value={exercise.rest_seconds}
                            onChange={(e) =>
                              updateExercise(dayIndex, exerciseIndex, { rest_seconds: e.target.value })
                            }
                          />
                        </label>

                        <div className="stack">
                          {exercise.sets.map((set, setIndex) => (
                            <div className="row program-editor-set-row" key={setIndex}>
                              <span className="muted">Set {setIndex + 1}</span>

                              {isTimeBased ? (
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="Sekunder"
                                  value={set.duration_seconds}
                                  onChange={(e) =>
                                    updateSet(dayIndex, exerciseIndex, setIndex, {
                                      duration_seconds: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                <>
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="Min reps"
                                    value={set.reps_min}
                                    onChange={(e) =>
                                      updateSet(dayIndex, exerciseIndex, setIndex, {
                                        reps_min: e.target.value,
                                      })
                                    }
                                  />
                                  <input
                                    type="number"
                                    min={0}
                                    placeholder="Max reps"
                                    value={set.reps_max}
                                    onChange={(e) =>
                                      updateSet(dayIndex, exerciseIndex, setIndex, {
                                        reps_max: e.target.value,
                                      })
                                    }
                                  />
                                </>
                              )}

                              <input
                                type="number"
                                min={0}
                                max={10}
                                placeholder="RPE"
                                value={set.target_rpe}
                                onChange={(e) =>
                                  updateSet(dayIndex, exerciseIndex, setIndex, { target_rpe: e.target.value })
                                }
                              />

                              <button
                                type="button"
                                className="btn-quiet"
                                onClick={() => removeSet(dayIndex, exerciseIndex, setIndex)}
                              >
                                Ta bort set
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="btn-ghost"
                          onClick={() => addSet(dayIndex, exerciseIndex)}
                        >
                          + Lägg till set
                        </button>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => addExercise(dayIndex)}
                    disabled={exercises.length === 0}
                  >
                    + Lägg till övning
                  </button>

                  {exercises.length === 0 && (
                    <p className="muted">Skapa minst en övning innan du lägger till den i ett program.</p>
                  )}
                </div>
              )}
            </section>
          ))}
        </div>

        <button type="button" className="btn-ghost" onClick={addDay}>
          + Lägg till dag
        </button>

        {formError && <p className="error">{formError}</p>}

        <div className="row">
          <button type="submit" disabled={saving}>
            {saving ? "Sparar..." : "Spara program"}
          </button>
          <button type="button" className="btn-quiet" onClick={() => navigate("/admin/programs")}>
            Avbryt
          </button>
        </div>
      </form>
    </main>
  );
}

export default AdminProgramEditor;
