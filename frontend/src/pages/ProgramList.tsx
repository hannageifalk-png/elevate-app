import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMockState } from "../context/mockState";
import { MEMBERSHIP_NAMES } from "../constants/membership";
import { lengthLabel } from "../lib/program";
import { MOCK_PROGRAMS } from "../mock/programs";
import "./training.css";

function ProgramList() {
  const { profile } = useAuth();
  const { state } = useMockState();
  const navigate = useNavigate();

  const role = profile?.role ?? 0;

  return (
    <main>
      <h1>Välj ett program</h1>

      {MOCK_PROGRAMS.map((program) => {
        const locked = role < program.app_user_role;
        const active = state.activeProgramId === program.id;

        const content = (
          <>
            <div className="program-image-wrap">
              <img className="program-image" src={program.image_url} alt="" />
              {locked && (
                <span className="lock-badge" aria-hidden="true">
                  <svg viewBox="0 0 20 20" width="16" height="16">
                    <path
                      fill="currentColor"
                      d="M5 8.5V6.5a5 5 0 0 1 10 0v2h.5A1.5 1.5 0 0 1 17 10v6a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16v-6a1.5 1.5 0 0 1 1.5-1.5zm2 0h6v-2a3 3 0 0 0-6 0z"
                    />
                  </svg>
                </span>
              )}
            </div>
            <p className="eyebrow">{program.program_type}</p>
            <h2>{program.name}</h2>
            <p>{program.description}</p>
            <p>
              {lengthLabel(program.week_count)} · {program.equipment_label} ·{" "}
              {program.recommended_sessions_per_week} pass/vecka
            </p>
            {active && <span className="badge">Aktivt program</span>}
          </>
        );

        if (locked) {
          return (
            <section key={program.id}>
              <div className="stack locked">{content}</div>
              <button type="button" onClick={() => navigate("/membership")}>
                Uppgradera till {MEMBERSHIP_NAMES[program.app_user_role]}
              </button>
            </section>
          );
        }

        return (
          <Link
            key={program.id}
            to={`/traning/program/${program.id}`}
            className="card card-link program-card"
          >
            {content}
          </Link>
        );
      })}

      <Link to="/traning">← Tillbaka till Träning</Link>
    </main>
  );
}

export default ProgramList;
