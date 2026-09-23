import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMockState } from "../context/mockState";
import { MEMBERSHIP_NAMES } from "../constants/membership";
import { dayToPassExercises, lengthLabel, setsLabel } from "../lib/program";
import { MOCK_PROGRAMS } from "../mock/programs";
import "./training.css";

function ProgramDetail() {
  const { programId } = useParams();
  const { profile } = useAuth();
  const { state, setActiveProgram, setDoneCount } = useMockState();
  const navigate = useNavigate();
  const [confirmingLeave, setConfirmingLeave] = useState(false);

  const program = MOCK_PROGRAMS.find((p) => p.id === programId);
  const role = profile?.role ?? 0;

  if (!program) {
    return (
      <main>
        <h1>Programmet finns inte</h1>
        <Link to="/traning/program">← Tillbaka till programlistan</Link>
      </main>
    );
  }

  if (role < program.app_user_role) {
    const planName = MEMBERSHIP_NAMES[program.app_user_role];

    return (
      <main>
        <h1>{program.name}</h1>

        <section>
          <h2>Uppgradering krävs</h2>
          <p>Programmet kräver medlemskapet {planName}.</p>
          <button type="button" onClick={() => navigate("/membership")}>
            Uppgradera till {planName}
          </button>
        </section>

        <Link to="/traning/program">← Tillbaka till programlistan</Link>
      </main>
    );
  }

  const activeProgram =
    MOCK_PROGRAMS.find((p) => p.id === state.activeProgramId) ?? null;
  const isActive = activeProgram?.id === program.id;
  const dayCount = program.days.length;
  const finished = isActive && state.doneCount >= dayCount;
  const nextDay =
    isActive && !finished ? program.days[state.doneCount % dayCount] : null;

  const startNext = () => {
    const day = program.schedule[state.doneCount % dayCount];
    setDoneCount(state.doneCount + 1);
    navigate("/traning/pass", {
      state: {
        sessionName: `${program.name} · ${day.name}`,
        exercises: dayToPassExercises(day.exercises),
      },
    });
  };

  const leave = () => {
    setActiveProgram(null);
    setConfirmingLeave(false);
  };

  return (
    <main>
      <section>
        <img className="program-image" src={program.image_url} alt="" />
        <p className="eyebrow">{program.program_type}</p>
        <h1>{program.name}</h1>
        <p>{program.description}</p>
        {isActive && <span className="badge">Aktivt program</span>}

        <dl className="program-meta">
          <div>
            <dt>Längd</dt>
            <dd>{lengthLabel(program.week_count)}</dd>
          </div>
          <div>
            <dt>Utrustning</dt>
            <dd>{program.equipment_label}</dd>
          </div>
          <div>
            <dt>Pass per vecka</dt>
            <dd>{program.recommended_sessions_per_week}</dd>
          </div>
          <div>
            <dt>Övningar</dt>
            <dd>{program.exercise_count}</dd>
          </div>
        </dl>
      </section>

      {isActive ? (
        <>
          <button
            type="button"
            className="btn-large"
            onClick={startNext}
            disabled={finished}
          >
            {finished ? `${program.name} är avklarat` : "Starta nästa pass"}
            {nextDay && <small>{nextDay}</small>}
          </button>

          {confirmingLeave ? (
            <section>
              <h3>Hoppa av {program.name}?</h3>
              <p>Dina genomförda pass ligger kvar i historiken.</p>
              <div className="row">
                <button type="button" onClick={leave}>
                  Ja, hoppa av
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setConfirmingLeave(false)}
                >
                  Avbryt
                </button>
              </div>
            </section>
          ) : (
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setConfirmingLeave(true)}
            >
              Hoppa av
            </button>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            className="btn-large"
            onClick={() => setActiveProgram(program.id)}
            disabled={activeProgram !== null}
          >
            Starta program
          </button>
          {activeProgram && (
            <p>
              Du följer redan {activeProgram.name}. Hoppa av det programmet först
              om du vill starta det här.
            </p>
          )}
        </>
      )}

      <h2>Vad ingår</h2>
      {program.schedule.map((day) => {
        const isNext = isActive && day.name === nextDay;

        return (
          <section key={day.name} className={isNext ? "next-day" : undefined}>
            <div className="row row-between">
              <h3>{day.name}</h3>
              {isNext && <span className="badge">Nästa</span>}
            </div>
            <ul className="exercise-list">
              {day.exercises.map((exercise) => (
                <li key={exercise.name}>
                  <span>{exercise.name}</span>
                  <span className="muted">{setsLabel(exercise.sets)}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <Link to="/traning/program">← Tillbaka till programlistan</Link>
    </main>
  );
}

export default ProgramDetail;
