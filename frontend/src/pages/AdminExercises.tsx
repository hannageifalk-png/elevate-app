import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch, getAccessToken } from "../lib/api";
import {
  EQUIPMENT_LABELS,
  MEASURE_TYPE_LABELS,
  MOVEMENT_PATTERN_LABELS,
} from "../lib/exerciseLabels";
import "./AdminExercises.css";

type MuscleRole = "primary" | "secondary";

type MuscleOption = {
  id: number;
  name: string;
  muscle_group: string | null;
};

type ExerciseMuscleLink = {
  muscle_id: number;
  role: MuscleRole;
  name: string;
  muscle_group: string | null;
};

type Exercise = {
  id: string;
  name: string;
  movement_pattern: string;
  equipment: string;
  measure_type: "reps" | "time";
  description: string;
  is_archived: boolean;
  muscles: ExerciseMuscleLink[];
};

type FormState = {
  name: string;
  movement_pattern: string;
  equipment: string;
  measure_type: "reps" | "time";
  description: string;
  is_archived: boolean;
  muscles: Record<number, MuscleRole>;
};

const EMPTY_FORM: FormState = {
  name: "",
  movement_pattern: "squat",
  equipment: "barbell",
  measure_type: "reps",
  description: "",
  is_archived: false,
  muscles: {},
};

function AdminExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscleOptions, setMuscleOptions] = useState<MuscleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [muscleGroupFilter, setMuscleGroupFilter] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
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

    const [exercisesResult, musclesResult] = await Promise.all([
      apiFetch("/api/admin/exercises", { token }),
      apiFetch("/api/admin/muscles", { token }),
    ]);

    if (!exercisesResult.success) {
      setLoadError(exercisesResult.message ?? "Kunde inte hämta övningar.");
      setLoading(false);
      return;
    }

    setExercises(exercisesResult.exercises);
    setMuscleOptions(musclesResult.muscles ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
  }, []);

  const groupedMuscleOptions: [string, MuscleOption[]][] = [];
  for (const muscle of muscleOptions) {
    const key = muscle.muscle_group ?? "Övrigt";
    const group = groupedMuscleOptions.find(([name]) => name === key);
    if (group) {
      group[1].push(muscle);
    } else {
      groupedMuscleOptions.push([key, [muscle]]);
    }
  }

  const muscleGroups = Array.from(
    new Set(muscleOptions.map((m) => m.muscle_group ?? "Övrigt"))
  ).sort((a, b) => a.localeCompare(b, "sv"));

  const query = search.trim().toLowerCase();
  const filteredExercises = exercises
    .filter((exercise) => exercise.is_archived === showArchived)
    .filter((exercise) => (query ? exercise.name.toLowerCase().includes(query) : true))
    .filter((exercise) =>
      muscleGroupFilter ? exercise.muscles.some((m) => m.muscle_group === muscleGroupFilter) : true
    );

  const visibleExercises = filteredExercises.slice(0, visibleCount);
  const hasMore = filteredExercises.length > visibleExercises.length;

  const activeCount = exercises.filter((e) => !e.is_archived).length;
  const archivedCount = exercises.filter((e) => e.is_archived).length;

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (exercise: Exercise) => {
    setEditingId(exercise.id);
    setForm({
      name: exercise.name,
      movement_pattern: exercise.movement_pattern,
      equipment: exercise.equipment,
      measure_type: exercise.measure_type,
      description: exercise.description,
      is_archived: exercise.is_archived,
      muscles: Object.fromEntries(exercise.muscles.map((m) => [m.muscle_id, m.role])),
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
  };

  const toggleMuscle = (muscleId: number, checked: boolean) => {
    setForm((prev) => {
      const muscles = { ...prev.muscles };
      if (checked) {
        muscles[muscleId] = "primary";
      } else {
        delete muscles[muscleId];
      }
      return { ...prev, muscles };
    });
  };

  const setMuscleRole = (muscleId: number, role: MuscleRole) => {
    setForm((prev) => ({ ...prev, muscles: { ...prev.muscles, [muscleId]: role } }));
  };

  const buildPayload = (source: FormState) => ({
    name: source.name.trim(),
    movement_pattern: source.movement_pattern,
    equipment: source.equipment,
    measure_type: source.measure_type,
    description: source.description.trim(),
    is_archived: source.is_archived,
    muscles: Object.entries(source.muscles).map(([muscleId, role]) => ({
      muscle_id: Number(muscleId),
      role,
    })),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setFormError("Namn krävs.");
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

    const payload = buildPayload(form);

    const result = editingId
      ? await apiFetch(`/api/admin/exercises/${editingId}`, { method: "PUT", token, body: payload })
      : await apiFetch("/api/admin/exercises", { method: "POST", token, body: payload });

    setSaving(false);

    if (!result.success) {
      setFormError(result.message ?? "Något gick fel.");
      return;
    }

    setFormOpen(false);
    await load();
  };

  const toggleArchive = async (exercise: Exercise) => {
    const token = await getAccessToken();
    if (!token) return;

    if (exercise.is_archived) {
      await apiFetch(`/api/admin/exercises/${exercise.id}`, {
        method: "PUT",
        token,
        body: buildPayload({
          name: exercise.name,
          movement_pattern: exercise.movement_pattern,
          equipment: exercise.equipment,
          measure_type: exercise.measure_type,
          description: exercise.description,
          is_archived: false,
          muscles: Object.fromEntries(exercise.muscles.map((m) => [m.muscle_id, m.role])),
        }),
      });
    } else {
      await apiFetch(`/api/admin/exercises/${exercise.id}`, { method: "DELETE", token });
    }

    await load();
  };

  if (loading) {
    return (
      <main>
        <p className="eyebrow">Admin</p>
        <h1>Övningar</h1>
        <p className="muted">Laddar...</p>
      </main>
    );
  }

  return (
    <main>
      <div>
        <p className="eyebrow">Admin</p>
        <h1>Övningar</h1>
        <p className="muted">Hantera övningskatalogen som används i program och eget pass.</p>
      </div>

      {loadError && <p className="error">{loadError}</p>}

      <div className="row row-between admin-toolbar">
        <input
          type="search"
          placeholder="Sök övning..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisibleCount(10);
          }}
        />
        <button type="button" onClick={openCreate}>
          + Ny övning
        </button>
      </div>

      <div className="row admin-tabs">
        <button
          type="button"
          className={showArchived ? "btn-ghost" : ""}
          onClick={() => {
            setShowArchived(false);
            setVisibleCount(10);
          }}
        >
          Aktiva ({activeCount})
        </button>
        <button
          type="button"
          className={showArchived ? "" : "btn-ghost"}
          onClick={() => {
            setShowArchived(true);
            setVisibleCount(10);
          }}
        >
          Arkiverade ({archivedCount})
        </button>
      </div>

      <label className="muscle-filter">
        Muskelgrupp
        <select
          value={muscleGroupFilter}
          onChange={(e) => {
            setMuscleGroupFilter(e.target.value);
            setVisibleCount(10);
          }}
        >
          <option value="">Alla muskelgrupper</option>
          {muscleGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </label>

      <div className="stack">
        {visibleExercises.length === 0 && <p className="muted">Inga övningar hittades.</p>}

        {visibleExercises.map((exercise) => {
          const sortedMuscles = [...exercise.muscles].sort((a, b) =>
            a.role === b.role ? 0 : a.role === "primary" ? -1 : 1
          );

          return (
            <article className="card exercise-card" key={exercise.id}>
              <div className="row row-between">
                <div>
                  <p className="eyebrow">
                    {MOVEMENT_PATTERN_LABELS[exercise.movement_pattern] ?? exercise.movement_pattern}
                  </p>
                  <h3>{exercise.name}</h3>
                </div>
                {exercise.is_archived && <span className="badge">Arkiverad</span>}
              </div>

              <p className="muted">{exercise.description || "Ingen beskrivning."}</p>

              <p className="muted">
                {EQUIPMENT_LABELS[exercise.equipment] ?? exercise.equipment} ·{" "}
                {MEASURE_TYPE_LABELS[exercise.measure_type]}
              </p>

              {sortedMuscles.length > 0 && (
                <div className="row">
                  {sortedMuscles.map((m) => (
                    <span
                      key={m.muscle_id}
                      className={`badge ${m.role === "primary" ? "badge-highlight" : "badge-muted"}`}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="row">
                <button type="button" className="btn-ghost" onClick={() => openEdit(exercise)}>
                  Redigera
                </button>
                <button type="button" className="btn-quiet" onClick={() => toggleArchive(exercise)}>
                  {exercise.is_archived ? "Återställ" : "Arkivera"}
                </button>
              </div>
            </article>
          );
        })}

        {hasMore && (
          <button type="button" className="btn-ghost" onClick={() => setVisibleCount((prev) => prev + 10)}>
            Ladda fler
          </button>
        )}
      </div>

      {formOpen && (
        <div className="dialog-overlay">
          <div
            className="dialog admin-form-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Redigera övning" : "Ny övning"}
          >
            <h2>{editingId ? "Redigera övning" : "Ny övning"}</h2>

            <form onSubmit={handleSubmit}>
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
                Rörelsemönster
                <select
                  value={form.movement_pattern}
                  onChange={(e) => setForm((prev) => ({ ...prev, movement_pattern: e.target.value }))}
                >
                  {Object.entries(MOVEMENT_PATTERN_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Utrustning
                <select
                  value={form.equipment}
                  onChange={(e) => setForm((prev) => ({ ...prev, equipment: e.target.value }))}
                >
                  {Object.entries(EQUIPMENT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Måttyp
                <select
                  value={form.measure_type}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, measure_type: e.target.value as "reps" | "time" }))
                  }
                >
                  {Object.entries(MEASURE_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Beskrivning
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </label>

              <div>
                <p className="eyebrow">Muskler</p>

                {groupedMuscleOptions.length === 0 && <p className="muted">Inga muskler hittades.</p>}

                <div className="muscle-groups">
                  {groupedMuscleOptions.map(([group, muscles]) => (
                    <div className="muscle-group" key={group}>
                      <p className="muscle-group-name">{group}</p>
                      <div className="muscle-options">
                        {muscles.map((muscle) => {
                          const role = form.muscles[muscle.id];
                          return (
                            <div className="muscle-option" key={muscle.id}>
                              <label className="picker-checkbox">
                                <input
                                  type="checkbox"
                                  checked={!!role}
                                  onChange={(e) => toggleMuscle(muscle.id, e.target.checked)}
                                />
                                {muscle.name}
                              </label>

                              {role && (
                                <select
                                  value={role}
                                  onChange={(e) => setMuscleRole(muscle.id, e.target.value as MuscleRole)}
                                >
                                  <option value="primary">Primär</option>
                                  <option value="secondary">Sekundär</option>
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {editingId && (
                <label className="picker-checkbox">
                  <input
                    type="checkbox"
                    checked={form.is_archived}
                    onChange={(e) => setForm((prev) => ({ ...prev, is_archived: e.target.checked }))}
                  />
                  Arkiverad
                </label>
              )}

              {formError && <p className="error">{formError}</p>}

              <div className="row">
                <button type="submit" disabled={saving}>
                  {saving ? "Sparar..." : "Spara"}
                </button>
                <button type="button" className="btn-quiet" onClick={closeForm} disabled={saving}>
                  Avbryt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminExercises;
