import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getAccessToken } from "../lib/api";
import { MEMBERSHIP_NAMES } from "../constants/membership";
import AdminNav from "../components/AdminNav";

type ProgramDay = {
  id: string;
  name: string;
  is_rest_day: boolean;
  exercises: { id: string }[];
};

type Program = {
  id: string;
  name: string;
  description: string;
  app_user_role: number;
  recommended_sessions_per_week: number;
  program_type: string;
  days: ProgramDay[];
};

function AdminPrograms() {
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const load = async () => {
    const token = await getAccessToken();

    if (!token) {
      setLoadError("Ingen giltig inloggning hittades.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    const result = await apiFetch("/api/admin/programs", { token });

    if (!result.success) {
      setLoadError(result.message ?? "Kunde inte hämta program.");
      setLoading(false);
      return;
    }

    setPrograms(result.programs);
    setLoading(false);
  };

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
  }, []);

  const handleDelete = async (programId: string) => {
    const token = await getAccessToken();
    if (!token) return;

    setDeleteError("");

    const result = await apiFetch(`/api/admin/programs/${programId}`, { method: "DELETE", token });

    if (!result.success) {
      setDeleteError(result.message ?? "Kunde inte ta bort programmet.");
      return;
    }

    setConfirmingDeleteId(null);
    await load();
  };

  if (loading) {
    return (
      <main>
        <AdminNav />
        <p className="eyebrow">Admin</p>
        <h1>Program</h1>
        <p className="muted">Laddar...</p>
      </main>
    );
  }

  return (
    <main>
      <AdminNav />

      <div>
        <p className="eyebrow">Admin</p>
        <h1>Program</h1>
        <p className="muted">Hantera de färdiga programmen användare kan följa på träningssidan.</p>
      </div>

      {loadError && <p className="error">{loadError}</p>}
      {deleteError && <p className="error">{deleteError}</p>}

      <div className="row row-between admin-toolbar">
        <button type="button" onClick={() => navigate("/admin/programs/new")}>
          + Nytt program
        </button>
      </div>

      <div className="stack">
        {programs.length === 0 && <p className="muted">Inga program hittades.</p>}

        {programs.map((program) => {
          const trainingDays = program.days.filter((day) => !day.is_rest_day);

          return (
            <article className="card" key={program.id}>
              <div className="row row-between">
                <div>
                  <p className="eyebrow">{program.program_type}</p>
                  <h3>{program.name}</h3>
                </div>
                <span className="badge">{MEMBERSHIP_NAMES[program.app_user_role]}</span>
              </div>

              <p className="muted">{program.description || "Ingen beskrivning."}</p>

              <p className="muted">
                {program.recommended_sessions_per_week} pass/vecka · {trainingDays.length} dagar
              </p>

              {trainingDays.length > 0 && (
                <p className="muted">{trainingDays.map((day) => day.name).join(" · ")}</p>
              )}

              {confirmingDeleteId === program.id ? (
                <div>
                  <p>Ta bort {program.name}? Går inte att ångra.</p>
                  <div className="row">
                    <button type="button" onClick={() => handleDelete(program.id)}>
                      Ja, ta bort
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setConfirmingDeleteId(null)}
                    >
                      Avbryt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="row">
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => navigate(`/admin/programs/${program.id}`)}
                  >
                    Redigera
                  </button>
                  <button
                    type="button"
                    className="btn-quiet"
                    onClick={() => setConfirmingDeleteId(program.id)}
                  >
                    Ta bort
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}

export default AdminPrograms;
