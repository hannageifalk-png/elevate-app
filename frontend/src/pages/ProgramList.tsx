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
            <img className="program-image" src={program.image_url} alt="" />
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
