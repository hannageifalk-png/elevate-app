import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import elevateLogo from "../assets/elevate-logo-transparent.png";
import "./HomePage.css";
import { useAuth } from "../context/AuthContext";
import {
  fetchProgramSchedule,
  countSessionsSinceStart,
  computeProgramProgress,
} from "../lib/program";
import type { ScheduleDay } from "../lib/program";
import ExercisePicker from "../components/ExercisePicker";
import { supabase } from "../lib/supabase";
import recoveryArticle from "../assets/recovery-article.png";
import exampleProgram from "../assets/example-program.jpg";


function HomePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [dailyWorkout, setDailyWorkout] = useState<ScheduleDay | null>(null);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
  const [articleExpanded, setArticleExpanded] = useState(false);
const [recentWorkouts, setRecentWorkouts] = useState<
  {
    id: string;
    performed_at: string;
    program_day: { name: string } | null;
  }[]
>([]);
    
  useEffect(() => {
        const loadDailyWorkout = async () => {
            const activeId = profile?.active_program_id;
    if (!activeId) {
      setDailyWorkout(null);
      return;
    }

  const schedule = await fetchProgramSchedule(activeId);

  const sessionsSinceStart =
  profile?.active_program_started_at && profile?.id
    ? await countSessionsSinceStart(
        profile.id,
        schedule.map((day) => day.id),
        profile.active_program_started_at,
    )
    : 0;

    const progress = computeProgramProgress(schedule, sessionsSinceStart);
    setDailyWorkout(progress.nextDay);
    };
      loadDailyWorkout();
    }, [profile?.active_program_id, profile?.active_program_started_at, profile?.id]);

      useEffect(() => {
  if (!profile?.id) return;

  const fetchRecentWorkouts = async () => {
    const { data, error } = await supabase
      .from("workout_session")
      .select(`
        id,
        performed_at,
        program_day (
        name
        )
      `)
      .eq("user_id", profile.id)
      .order("performed_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Kunde inte hämta senaste träningspassen:", error);
      return;
    }

    const normalizedWorkouts = (data ?? []).map((workout) => ({
      id: workout.id,
      performed_at: workout.performed_at,
      program_day: workout.program_day?.[0] ?? null,
}));

    setRecentWorkouts(normalizedWorkouts);
  };

  fetchRecentWorkouts();
}, [profile?.id]);

  return (

  <main className="homePage">

  <header className="homeHeader">
    <img src={elevateLogo} alt="Elevate" />
  </header>

  <section className="dailyWorkout">
  <img
    src={exampleProgram}
    alt="Träning"
    className="dailyWorkoutImage"
  />

  <div className="dailyWorkoutContent">
    <h2>Dagens pass</h2>
    <h3>{dailyWorkout?.name ?? "Dagens pass"}</h3>
    <p>{dailyWorkout?.exercises.length ?? 0} övningar</p>

    <button onClick={() => navigate("/training")}>
      SE PASS →
    </button>
  </div>
</section>

  <section className="recentWorkouts">
    <h2>Senaste träning</h2>

    {recentWorkouts.length === 0 ? (
      <p>Du har inga registrerade träningspass ännu.</p>
    ) : (
      <div className="recentWorkoutList">
        {recentWorkouts.map((workout) => (
          <article key={workout.id} className="recentWorkoutItem">
            <h3>{workout.program_day?.name ?? "Eget träningspass"}</h3>
            <p>
              {new Date(workout.performed_at).toLocaleDateString("sv-SE", {
                day: "numeric",
                month: "short",
              })}
            </p>
          </article>
        ))}
      </div>
    )}
  </section>

  <div className="exploreGrid">
    <article className="exploreItem">
      <h2>Utforska träning</h2>

      <p>
        Sugen på att testa något nytt? Utforska övningar, träningsprogram
        och träningspass för att hitta det som passar dig.
      </p>

      <div className="exploreOptions">
        <button
          type="button"
          onClick={() => setExercisePickerOpen(true)}
        >
          UTFORSKA ÖVNINGAR →
        </button>

        <button
          type="button"
          onClick={() => navigate("/training/program")}
        >
          TRÄNINGSPROGRAM →
        </button>

        <button
          type="button"
          onClick={() => navigate("/training/dagens")}
        >
          SKAPA EGET TRÄNINGSPASS →
        </button>
      </div>
    </article>
  </div>

<section className="learnSection">
  <h2>Träning och hälsa</h2>

  <article className="articleCard">
    <img
      src={recoveryArticle}
      alt="Person som återhämtar sig efter träning"
      className="articleImage"
    />

    <div className="articleContent">
      <h3>Återhämtning är en del av träningen</h3>

      <p>
        Träningen är bara en del av utvecklingen. Under återhämtningen får
        kroppen möjlighet att reparera sig, bygga upp sig och anpassa sig
        till träningen.
      </p>

      {articleExpanded && (
        <p>
          Återhämtning handlar inte bara om vilodagar. Sömn, mat, vätska och
          tid mellan träningspassen påverkar hur kroppen återhämtar sig.
          Genom att ge kroppen rätt förutsättningar kan du träna mer
          hållbart och skapa bättre förutsättningar för utveckling över tid.
        </p>
      )}

      <button
        type="button"
        className="articleButton"
        onClick={() => setArticleExpanded((current) => !current)}
      >
        {articleExpanded ? "VISA MINDRE ↑" : "LÄS MER →"}
      </button>
    </div>
  </article>
</section>

  {exercisePickerOpen && (
    <ExercisePicker
      onPick={() => setExercisePickerOpen(false)}
      onClose={() => setExercisePickerOpen(false)}
    />
  )}

</main>
  );
}

export default HomePage;