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


function HomePage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dailyWorkout, setDailyWorkout] = useState<ScheduleDay | null>(null);
  const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
    
  useEffect(() => {
        const loadDailyWorkout = async () => {
            const activeId = profile?.active_program_id;
    if (!activeId) {
      setDailyWorkout(null);
      setLoading(false);
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
    setLoading(false);
    };
      loadDailyWorkout();
    }, [profile?.active_program_id, profile?.active_program_started_at, profile?.id]);

  return (

    <main className="homePage">

      <header className="homeHeader">
        <img src={elevateLogo} alt="Elevate" />
      </header>

      <section className="welcomeSection">
        <h1>Hej!</h1>
        <p>Vad vill du träna idag?</p>
      </section>

      <section className="dailyWorkout">
        <h2>Dagens pass</h2>
        <h3>{dailyWorkout?.name ?? "Dagens pass"}</h3>
          <p>{dailyWorkout?.exercises.length ?? 0} övningar</p>
          <button onClick={() => navigate("/traning")}>
  SE PASS →
</button>
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
        onClick={() => navigate("/traning/program")}
      >
        TRÄNINGSPROGRAM →
      </button>

      <button
      type="button"
      onClick={() => navigate("/traning/dagens")}
    >
      SKAPA EGET TRÄNINGSPASS →
    </button>

    </div>
    </article>
    </div>

      <section className="recentWorkouts">

        <h2>Senaste träning</h2>
        <p>Här visas dina senaste träningspass.</p>
      </section>

      <section className="premiumSection">

        <h2>Mer för dig</h2>

        <article className="lockedCard">
          <h3>Din detaljerade statistik</h3>
          <p>🔒 Uppgradera ditt medlemskap för att se mer.</p>
          <button>UPPGRADERA</button>
        </article>

        <article className="lockedCard">
          <h3>Artiklar & träning</h3>
          <p>🔒 Upptäck mer innehåll med ett uppgraderat medlemskap.</p>
          <button>UPPGRADERA</button>
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