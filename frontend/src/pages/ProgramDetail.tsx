import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MEMBERSHIP_NAMES } from "../constants/membership";
import { dayToPassExercises, lengthLabel, setsLabel } from "../lib/program";
import type { ProgramOverview, SetTemplate } from "../lib/program";
import { supabase } from "../lib/supabase";
import exampleProgram from "../assets/example-program.jpg";
import "./training.css";

type ScheduleDay = {
  id: string;
  name: string;
  exercises: { name: string; sets: SetTemplate[] }[];
};

function ProgramDetail() {
  const { programId } = useParams();
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [program, setProgram] = useState<ProgramOverview | null>(null);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [startError, setStartError] = useState("");
  const [loadError, setLoadError] = useState(false);

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

      const { data: weeks } = await supabase
        .from("program_week")
        .select("id, week_number")
        .eq("program_id", programId)
        .order("week_number");

      const weekIds = (weeks ?? []).map((week) => week.id);

      const { data: days } = await supabase
        .from("program_day")
        .select("id, program_week_id, day_number, name, is_rest_day")
        .in("program_week_id", weekIds)
        .order("day_number");

      const dayIds = (days ?? []).map((day) => day.id);

      const { data: slots } = await supabase
        .from("exercise_slot")
        .select("id, program_day_id, exercise_id, sort_order")
        .in("program_day_id", dayIds)
        .order("sort_order");

      const exerciseIds = (slots ?? []).map((slot) => slot.exercise_id);

      const { data: exercises } = await supabase
        .from("exercise")
        .select("id, name")
        .in("id", exerciseIds);

      const slotIds = (slots ?? []).map((slot) => slot.id);

      const { data: sets } = await supabase
        .from("set_template")
        .select("id, exercise_slot_id, set_number, reps_min, reps_max, duration_seconds")
        .in("exercise_slot_id", slotIds)
        .order("set_number");

      const trainingDays = (days ?? []).filter((day) => !day.is_rest_day);

      const builtSchedule = trainingDays.map((day) => {
        const daySlots = (slots ?? []).filter(
          (slot) => slot.program_day_id === day.id
        );

        const dayExercises = daySlots.map((slot) => {
          const exercise = (exercises ?? []).find(
            (e) => e.id === slot.exercise_id
          );
          const exerciseSets = (sets ?? [])
            .filter((set) => set.exercise_slot_id === slot.id)
            .map((set) => ({
              reps_min: set.reps_min,
              reps_max: set.reps_max,
              duration_seconds: set.duration_seconds,
            }));

          return {
            name: exercise?.name ?? "Okänd övning",
            sets: exerciseSets,
          };
        });

        return { id: day.id, name: day.name, exercises: dayExercises };
      });

      setProgram(overview ?? null);
      setSchedule(builtSchedule);
      setLoading(false);
    };

    loadProgram();
  }, [programId]);

  const role = profile?.role ?? 0;

  const startProgram = async () => {
    if (!program) return;

    setStartError("");
    const { error } = await supabase.rpc("start_program", {
      p_program_id: program.id,
    });

    if (error) {
      setStartError(error.message);
      return;
    }

    await refreshProfile();
  };

  const startFirstSession = async () => {
    const firstDay = schedule[0];
    if (!firstDay || !program) return;

    setStartError("");
    const { error } = await supabase.rpc("start_program_day", {
      p_day_id: firstDay.id,
    });

    if (error) {
      setStartError(error.message);
      return;
    }

    navigate("/traning/pass", {
      state: {
        sessionName: `${program.name} · ${firstDay.name}`,
        exercises: dayToPassExercises(firstDay.exercises),
      },
    });
  };

  const leaveProgram = async () => {
    const { error } = await supabase.rpc("leave_program");

    if (error) {
      setStartError(error.message);
      return;
    }

    await refreshProfile();
    setConfirmingLeave(false);
  };

  if (loading) {
    return (
      <main>
        <p>Laddar...</p>
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

  const isActive = profile?.active_program_id === program.id;

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
          <button type="button" className="btn-large" onClick={startFirstSession}>
            Starta första passet
          </button>
          {startError && <p>{startError}</p>}

          {confirmingLeave ? (
            <section>
              <h3>Hoppa av {program.name}?</h3>
              <p>Dina genomförda pass ligger kvar i historiken.</p>
              <div className="row">
                <button type="button" onClick={leaveProgram}>
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
            onClick={startProgram}
            disabled={profile?.active_program_id != null}
          >
            Starta program
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
