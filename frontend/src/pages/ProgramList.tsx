import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MEMBERSHIP_NAMES } from "../constants/membership";
import { lengthLabel } from "../lib/program";
import type { ProgramOverview } from "../lib/program";
import { supabase } from "../lib/supabase";
import exampleProgram from "../assets/example-program.jpg";
import SkeletonBar from "../components/SkeletonBar";
import "./training.css";

function ProgramList() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [programs, setPrograms] = useState<ProgramOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrograms = async () => {
      const { data } = await supabase.from("program_overview").select("*");
      setPrograms(data ?? []);
      setLoading(false);
    };

    loadPrograms();
  }, []);

  const role = profile?.role ?? 0;

  if (loading) {
    return (
      <main>
        <h1>Välj ett program</h1>
        {[1, 2].map((i) => (
          <div className="card program-card" key={i}>
            <div className="program-image-wrap">
              <div className="skeleton program-image" />
            </div>
            <SkeletonBar height={12} width="30%" />
            <SkeletonBar height={22} width="60%" />
            <SkeletonBar height={14} width="90%" />
          </div>
        ))}
      </main>
    );
  }

  return (
    <main>
      <h1>Välj ett program</h1>

      {programs.map((program) => {
        const locked = role < program.app_user_role;
        const active = profile?.active_program_id === program.id;

        const content = (
          <>
            <div className="program-image-wrap">
              <img className="program-image" src={exampleProgram} alt="" />
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
            to={`/training/program/${program.id}`}
            className="card card-link program-card"
          >
            {content}
          </Link>
        );
      })}

      <Link to="/training">← Tillbaka till Träning</Link>
    </main>
  );
}

export default ProgramList;
