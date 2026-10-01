import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProgramCompleteDialog from "../components/ProgramCompleteDialog";
import { useAuth } from "../context/AuthContext";
import {
  attachSessionExerciseIds,
  computeProgramProgress,
  countSessionsSinceStart,
  dayToPassExercises,
  fetchProgramSchedule,
  fetchSessionExercises,
} from "../lib/program";
import type { ProgramOverview, ProgramProgress } from "../lib/program";
import { supabase } from "../lib/supabase";
import SkeletonBar from "../components/SkeletonBar";
import "./training.css";

const EMPTY_PROGRESS: ProgramProgress = {
  dayCount: 0,
  finished: false,
  nextDay: null,
};

function Training() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();

  const [program, setProgram] = useState<ProgramOverview | null>(null);
  const [progress, setProgress] = useState<ProgramProgress>(EMPTY_PROGRESS);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const activeId = profile?.active_program_id;

      if (!activeId) {
        setProgram(null);
        setProgress(EMPTY_PROGRESS);
        setLoading(false);
        return;
      }

      const { data: overview } = await supabase
        .from("program_overview")
        .select("*")
        .eq("id", activeId)
        .single();

      const schedule = await fetchProgramSchedule(activeId);

      const sessionsSinceStart =
        profile?.active_program_started_at && profile?.id
          ? await countSessionsSinceStart(
              profile.id,
              schedule.map((day) => day.id),
              profile.active_program_started_at,
            )
          : 0;

      setProgram(overview ?? null);
      setProgress(computeProgramProgress(schedule, sessionsSinceStart));
      setLoading(false);
    };

    load();
  }, [profile?.active_program_id, profile?.active_program_started_at, profile?.id]);

  const startNext = async () => {
    if (!progress.nextDay || !program) return;

    setActionError("");
    setPending(true);
    const { data: workoutSessionId, error } = await supabase.rpc(
      "start_program_day",
      { p_day_id: progress.nextDay.id },
    );

    if (error || !workoutSessionId) {
      setPending(false);
      setActionError(error?.message ?? "Passet kunde inte startas");
      return;
    }

    const sessionExercises = await fetchSessionExercises(workoutSessionId);
    setPending(false);

    navigate("/training/pass", {
      state: {
        sessionName: `${program.name} · ${progress.nextDay.name}`,
        workoutSessionId,
        exercises: attachSessionExerciseIds(
          dayToPassExercises(progress.nextDay.exercises),
          sessionExercises,
        ),
      },
    });
  };

  const restart = async () => {
    if (!program) return;

    setActionError("");
    setPending(true);
    const { error } = await supabase.rpc("start_program", {
      p_program_id: program.id,
    });

    if (error) {
      setPending(false);
      setActionError(error.message);
      return;
    }

    await refreshProfile();
    setPending(false);
  };

  const leaveActiveProgram = async () => {
    setActionError("");
    setPending(true);
    const { error } = await supabase.rpc("leave_program");

    if (error) {
      setPending(false);
      setActionError(error.message);
      return false;
    }

    await refreshProfile();
    setPending(false);
    return true;
  };

  const browse = async () => {
    if (await leaveActiveProgram()) {
      navigate("/training/program");
    }
  };

  if (loading) {
    return (
      <main>
        <h1>Träning</h1>
        <SkeletonBar height={84} width="100%" />
        <SkeletonBar height={52} width="100%" />
      </main>
    );
  }

  return (
    <main>
      <h1>Träning</h1>

      {program ? (
        <button
          type="button"
          className="btn-large"
          onClick={startNext}
          disabled={progress.finished || pending}
        >
          {pending
            ? "..."
            : progress.finished
              ? `${program.name} är avklarat`
              : `Starta nästa pass i ${program.name}`}
          {!pending && progress.nextDay && <small>{progress.nextDay.name}</small>}
        </button>
      ) : (
        <button
          type="button"
          className="btn-large"
          onClick={() => navigate("/training/program")}
        >
          Välj ett program
        </button>
      )}

      {actionError && <p>{actionError}</p>}

      <button
        type="button"
        className="btn-large btn-ghost"
        onClick={() => navigate("/training/dagens")}
      >
        Skapa ditt eget pass
      </button>

      {program && (
        <Link to={`/training/program/${program.id}`}>Visa {program.name}</Link>
      )}

      {program && progress.finished && (
        <ProgramCompleteDialog
          programName={program.name}
          onRestart={restart}
          onBrowse={browse}
          onContinue={leaveActiveProgram}
          pending={pending}
        />
      )}
    </main>
  );
}

export default Training;
