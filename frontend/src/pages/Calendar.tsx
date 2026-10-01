import { useEffect, useState } from "react";
import "./Calendar.css";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { describeExercise, fetchSessionExercises } from "../lib/program";

function Calendar() {
  const { profile } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());

  const [workoutMuscles, setWorkoutMuscles] = useState<
  Record<string, string[]>
  >({});

  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
  if (!profile) return;

  const loadWorkouts = async () => {
    const { data, error } = await supabase
      .from("workout_session")
      .select("id, performed_at")
      .eq("user_id", profile.id)
      .order("performed_at", { ascending: false });

    if (error) {
      console.error("Kunde inte hämta träningspass:", error);
      return;
    }

    for (const workout of data ?? []) {
      const exercises = await fetchSessionExercises(workout.id);

      const muscles = exercises.map((exercise) => {
        return describeExercise(exercise.name).muscleGroup;
});

const uniqueMuscles = [...new Set(muscles)];

const date = workout.performed_at.slice(0, 10);

setWorkoutMuscles((current) => ({
  ...current,
  [date]: uniqueMuscles,
}));
}
 };

  loadWorkouts();
}, [profile?.id]);

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const previousMonth = () => {
  setCurrentDate(
    new Date(year, monthIndex - 1, 1)
  );
};

const nextMonth = () => {
  setCurrentDate(
    new Date(year, monthIndex + 1, 1)
  );
};

  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === monthIndex;
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
);

const emptyDays = Array.from(
  { length: startDay },
  () => null
);

const monthName = currentDate.toLocaleString("sv-SE", {
  month: "long",
});

const month =
  monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const getMuscleColor = (muscle: string) => {
  switch (muscle) {
    case "Ben":
      return "green";
    case "Rygg":
      return "blue";
    case "Bröst":
      return "purple";
    case "Axlar":
      return "yellow";
    case "Armar":
      return "orange";
    case "Core":
      return "red";
    default:
      return "";
  }
};

return (


    <main>
      <div className="calendarHeader">
  <button onClick={previousMonth}>‹</button>

  <h1>{month}</h1>

  <button onClick={nextMonth}>›</button>
</div>

    <div className="weekDays">
      <span>Mån</span>
      <span>Tis</span>
      <span>Ons</span>
      <span>Tor</span>
      <span>Fre</span>
      <span>Lör</span>
      <span>Sön</span>
    </div>
      
<div className="calendarGrid">
  {emptyDays.map((_, index) => (
    <div key={`empty-${index}`}></div>
  ))}

{days.map((day) => {
  const isToday = isCurrentMonth && day === today.getDate();

  const dateKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const musclesForDay = workoutMuscles[dateKey] ?? [];

  return (
  <button
    key={day}
    className={isToday ? "today" : ""}
  >
    <span>{day}</span>

    <div className="muscleDots">
      {musclesForDay
        .filter((muscle) => muscle)
        .map((muscle) => (
          <span
            key={muscle}
            className="muscleDot"
            style={{
              backgroundColor: getMuscleColor(muscle),
            }}
          />
        ))}
    </div>
  </button>
);
})}

</div>

<button
  className="muscleLegendButton"
  type="button"
  onClick={() => setLegendOpen((current) => !current)}
>
  <span className="legendDot legendGreen"></span>
  <span className="legendDot legendBlue"></span>
  <span className="legendDot legendPurple"></span>
  <span className="legendDot legendYellow"></span>
  <span className="legendDot legendOrange"></span>
  <span className="legendDot legendRed"></span>
</button>

{legendOpen && (
  <div className="muscleLegendModal">
    <div className="muscleLegendContent">
      <h2>Muskelgrupper</h2>
      <p>🟢 Ben</p>
      <p>🔵 Rygg</p>
      <p>🟣 Bröst</p>
      <p>🟡 Axlar</p>
      <p>🟠 Armar</p>
      <p>🔴 Core</p>
    </div>
  </div>
)}

    </main>
  );
}

export default Calendar;