import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MEMBERSHIP_NAMES } from "../constants/membership";
import {
  computeProgramProgress,
  countSessionsSinceStart,
  dayToPassExercises,
  fetchProgramSchedule,
  lengthLabel,
  setsLabel,
} from "../lib/program";
import type { ProgramOverview, ProgramProgress, ScheduleDay } from "../lib/program";
import { supabase } from "../lib/supabase";
import exampleProgram from "../assets/example-program.jpg";
import SkeletonBar from "../components/SkeletonBar";
import "./training.css";

const EMPTY_PROGRESS: ProgramProgress = {
  dayCount: 0,
  finished: false,
  nextDay: null,
};

function ProgramDetail() {
  const { programId } = useParams();
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [program, setProgram] = useState<ProgramOverview | null>(null);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [progress, setProgress] = useState<ProgramProgress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [startError, setStartError] = useState("");
  const [loadError, setLoadError] = useState(false);
  const [pending, setPending] = useState(false);

  const isActive = profile?.active_program_id === programId;

  useEffect(() => {
    const loadProgram = async () => {
      if (!programId) return;

      const { data: overview, error: overviewError } = await supabase
        .from("program_overview")
        .select("*")
        .eq("id", programId)
        .single();

      if (overviewError) {
        setLoadError(true);
        setLoading(false);
        return;
      }

      const days = await fetchProgramSchedule(programId);

      const sessionsSinceStart =
        isActive && profile?.active_program_started_at && profile?.id
          ? await countSessionsSinceStart(
              profile.id,
              days.map((day) => day.id),
              profile.active_program_started_at,
            )
          : 0;

      setProgram(overview ?? null);
      setSchedule(days);
      setProgress(
        isActive
          ? computeProgramProgress(days, sessionsSinceStart)
          : EMPTY_PROGRESS,
      );
      setLoading(false);
    };

    loadProgram();
  }, [programId, isActive, profile?.active_program_started_at, profile?.id]);

  const role = profile?.role ?? 0;

  const startProgram = async () => {
    if (!program) return;

    setStartError("");
    setPending(true);
    const { error } = await supabase.rpc("start_program", {
      p_program_id: program.id,
    });

    if (error) {
      setPending(false);
      setStartError(error.message);
      return;
    }

    await refreshProfile();
    setPending(false);
  };

  const startNextSession = async () => {
    if (!progress.nextDay || !program) return;

    setStartError("");
    setPending(true);
    const { error } = await supabase.rpc("start_program_day", {
      p_day_id: progress.nextDay.id,
    });
    setPending(false);

    if (error) {
      setStartError(error.message);
      return;
    }

    navigate("/traning/pass", {
      state: {
        sessionName: `${program.name} · ${progress.nextDay.name}`,
        exercises: dayToPassExercises(progress.nextDay.exercises),
      },
    });
  };

  const leaveProgram = async () => {
    setPending(true);
    const { error } = await supabase.rpc("leave_program");

    if (error) {
      setPending(false);
      setStartError(error.message);
      return;
    }

    await refreshProfile();
    setPending(false);
    setConfirmingLeave(false);
  };

  if (loading) {
    return (
      <main>
        <section>
          <div className="skeleton program-image" />
          <SkeletonBar height={12} width="30%" />
          <SkeletonBar height={28} width="60%" />
          <SkeletonBar height={14} width="90%" />
        </section>
        <SkeletonBar height={52} width="100%" />
      </main>
    );
  }

  if (loadError) {
    return (
      <main>
        <h1>Programmet kunde inte hämtas</h1>
        <p>Något gick fel. Prova att ladda om sidan.</p>
        <Link to="/traning/program">← Tillbaka till programlistan</Link>
      </main>
    );
  }

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

  return (
    <main>
      <section>
        <img className="program-image" src={exampleProgram} alt="" />
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
          {progress.finished ? (
            <p>
              Du har klarat {program.name}. Gå till Träning för att köra
              programmet igen eller välja ett nytt.
            </p>
          ) : (
            <button
              type="button"
              className="btn-large"
              onClick={startNextSession}
              disabled={!progress.nextDay || pending}
            >
              {pending ? "..." : "Starta nästa pass"}
              {!pending && progress.nextDay && (
                <small>{progress.nextDay.name}</small>
              )}
            </button>
          )}
          {startError && <p>{startError}</p>}

          {confirmingLeave ? (
            <section>
              <h3>Hoppa av {program.name}?</h3>
              <p>Dina genomförda pass ligger kvar i historiken.</p>
              <div className="row">
                <button type="button" onClick={leaveProgram} disabled={pending}>
                  {pending ? "..." : "Ja, hoppa av"}
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
            onClick={startProgram}
            disabled={profile?.active_program_id != null || pending}
          >
            {pending ? "..." : "Starta program"}
          </button>
          {profile?.active_program_id != null && (
            <p>
              Du följer redan ett annat program. Hoppa av det först om du vill
              starta det här.
            </p>
          )}
          {startError && <p>{startError}</p>}
        </>
      )}

      <h2>Vad ingår</h2>
      {schedule.map((day) => (
        <section key={day.name}>
          <h3>{day.name}</h3>
          <ul className="exercise-list">
            {day.exercises.map((exercise) => (
              <li key={exercise.name}>
                <span>{exercise.name}</span>
                <span className="muted">{setsLabel(exercise.sets)}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <Link to="/traning/program">← Tillbaka till programlistan</Link>
    </main>
  );
}

export default ProgramDetail;
