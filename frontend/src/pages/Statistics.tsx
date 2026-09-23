import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

import "./Statistics.css";

const lifts = [
  {
    name: "Bänkpress",
    exerciseId: "8415c19c-5502-476a-9cf5-5a9f037824d4",
  },
  {
    name: "Knäböj",
    exerciseId: "8e46cb56-e7ed-40ef-bf69-c56e9df6166e",
  },
  {
    name: "Marklyft",
    exerciseId: "c0996afa-1a19-4a69-bf4f-4500a8ba8d42",
  },
  {
    name: "Militärpress",
    exerciseId: "fb01cdad-d0ca-4489-9f93-ef93bbc20632",
  },
];


function Statistics() {
    const { profile } = useAuth();
    
    const [selectedLift, setSelectedLift] = useState(lifts[0]);
    const [period, setPeriod] = useState<"week" | "month">("week");
    const [chartPeriod, setChartPeriod] =
    useState<"week" | "month">("week");
    
    const [liftRecords, setLiftRecords] = useState<number[]>([
        0, 0, 0, 0, 0,
    ]);
    
    const [strengthData, setStrengthData] = useState<
    { period: string; weight: number, date: string }[]
    >([]);
    
    const [sessions, setSessions] = useState<
    { id: string; performed_at: string }[]
    >([]);
    
    const [allSets, setAllSets] = useState<
        {
            weight: number;
            reps_done: number;
            completed_at: string;
            exerciseId: string;
        }[]
     >([]);
    
    const displayedRecords = liftRecords;


    const filteredSessions = sessions.filter((session) => {
      const sessionDate = new Date(session.performed_at);
      const today = new Date();

    const days = period === "week" ? 7 : 30;

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);

    return sessionDate >= startDate && sessionDate <= today;
    });

    const workouts = filteredSessions.length;

    const trainingDays = new Set(
    filteredSessions.map((session) =>
        new Date(session.performed_at).toLocaleDateString("sv-SE")
    )
    ).size;

    

  useEffect(() => {

    if (!profile) return;

    const fetchLiftRecords = async () => {
        const { data, error } = await supabase
            .from("logged_set")
            .select(`
                weight,
                reps_done,
                session_exercise!inner (
                 exercise_id,
                 substituted_exercise_id,
                 workout_session!inner (
                    user_id,
                    performed_at
                 )
                )
            `)
            .eq(
                "session_exercise.workout_session.user_id",
                profile.id
            )
            .eq(
                "session_exercise.exercise_id",
                selectedLift.exerciseId
            )
            .gte("reps_done", 1)
            .lte("reps_done", 5)
            .not("weight", "is", null);

        if (error) {
            console.error("Kunde inte hämta statistik:", error);
         return;
            }

         const records = [0, 0, 0, 0, 0];

        data.forEach((set) => {
            const reps = set.reps_done;
            const weight = Number(set.weight);

            if (reps >= 1 && reps <= 5) {
                records[reps - 1] = Math.max(
                records[reps - 1],
                weight
                );
            }
            });

        setLiftRecords(records);

    const oneRepMaxData = data
        .filter((set) => set.reps_done === 1)
        .map((set) => {
            const sessionExercise = set.session_exercise as unknown as {
            workout_session: {
                performed_at: string;
            };
            };

        return {
            period: new Date(
                sessionExercise.workout_session.performed_at
            ).toLocaleDateString("sv-SE", {
                day: "numeric",
                month: "short",
            }),

            weight: Number(set.weight),

            date: sessionExercise.workout_session.performed_at,
            };
        });

        setStrengthData(oneRepMaxData);

    };

    fetchLiftRecords();
    }, [profile, selectedLift.exerciseId]);

    
    
   useEffect(() => {
        if (!profile) return;

        const fetchSessions = async () => {
                const { data, error } = await supabase
                .from("workout_session")
                .select("id, performed_at")
                .eq("user_id", profile.id)
                .order("performed_at", { ascending: true });

                if (error) {
                console.error("Kunde inte hämta träningspass:", error);
                return;
                }

                setSessions(data ?? []);
            };

            fetchSessions();
            }, [profile]);

    useEffect(() => {
        if (!profile) return;

        const fetchAllSets = async () => {
            const { data, error } = await supabase
            .from("logged_set")
            .select(`
                weight,
                reps_done,
                completed_at,
                session_exercise!inner (
                exercise_id,
                workout_session!inner (
                    user_id
                )
                )
            `)
            .eq(
                "session_exercise.workout_session.user_id",
                profile.id
            )
            .not("weight", "is", null)
            .not("reps_done", "is", null)
            .order("completed_at", { ascending: true });

            if (error) {
                console.error("Kunde inte hämta set:", error);
                return;
            }

            const formattedSets = data.map((set) => {
                const sessionExercise = set.session_exercise as unknown as {
                    exercise_id: string;
                };

                return {
                    weight: Number(set.weight),
                    reps_done: Number(set.reps_done),
                    completed_at: set.completed_at,
                    exerciseId: sessionExercise.exercise_id,
                };
             });

                setAllSets(formattedSets);
        };

        fetchAllSets();
        }, [profile]);

    const personalRecords = (() => {
        const bestRecords = new Map<string, number>();
        let count = 0;

        allSets.forEach((set) => {
            const key = `${set.exerciseId}-${set.reps_done}`;
            const previousBest = bestRecords.get(key) ?? 0;

            if (set.weight > previousBest) {
            const setDate = new Date(set.completed_at);
            const today = new Date();

            const days = period === "week" ? 7 : 30;

            const startDate = new Date(today);
            startDate.setDate(today.getDate() - days);

            if (setDate >= startDate && setDate <= today) {
                count++;
            }

            bestRecords.set(key, set.weight);
            }
        });

        return count;
        })();


    const filteredStrengthData = strengthData.filter((item) => {
        const itemDate = new Date(item.date);
        const today = new Date();

        const days = chartPeriod === "week" ? 7 : 30;

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - days);

        return itemDate >= startDate && itemDate <= today;
  });



  if (!profile) {
    return <p>Laddar...</p>;
  }

  const hasStatisticsAccess = profile.role === 2 || profile.role === 3;

  if (!hasStatisticsAccess) {
    return (
        <main className="statistics">
        <section className="statistics-lock">
            <p>Statistik</p>
            <h1>Följ mina framsteg</h1>

            <h2>Premiumfunktion</h2>

            <p>
            Uppgradera till Premium för att följa din styrkeutveckling,
            se dina personbästa och jämföra din träning över tid.
            </p>

            <Link to="/membership" className="upgrade-button">
            Uppgradera till Premium
            </Link>
        </section>
        </main>
    );
 }

  return (
    <main className="statistics">
        <header>
        <p>Statistik</p>
        <h1>Följ mina framsteg</h1>
        </header>

        <section className="overview">
            <div className="period-toggle">
                <button
                className={period === "week" ? "active" : ""}
                onClick={() => setPeriod("week")}
                >
                Vecka
                </button>

                <button
                className={period === "month" ? "active" : ""}
                onClick={() => setPeriod("month")}
                >
                Månad
                </button>
            </div>

            <div className="overview-grid">
                <div className="overview-card">
                <strong>{workouts}</strong>
                <span>Pass</span>
                </div>

                <div className="overview-card">
                <strong>{personalRecords}</strong>
                <span>Personbästa</span>
                </div>

                <div className="overview-card">
                <strong>{trainingDays}</strong>
                <span>Träningsdagar</span>
                </div>
            </div>
        </section>

        <section>
        <h2>De fyra lyften</h2>

        <div className="lift-grid">
            {lifts.map((lift) => (
            <button
                className={`lift-card ${
                    selectedLift.name === lift.name ? "selected" : ""
                }`}
                key={lift.name}
                onClick={() => setSelectedLift(lift)}
                >
                <span>{lift.name}</span>
            </button>
            ))}
        </div>

        <div className="rm-card">
            <h3>{selectedLift.name}</h3>

            <div className="rm-list">
                {displayedRecords.map((weight, index) => (
                <div className="rm-row" key={index}>
                    <span>{index + 1}RM</span>
                    <strong>
                      {weight > 0 ? `${weight} kg` : "–"}
                    </strong>
                </div>
                ))}
            </div>
        </div>
    </section>

    <section className="strength-progress">
        <div className="strength-header">
                <div>
                <p>Utveckling</p>
                <h2>Styrkeutveckling</h2>
                </div>

                <span>{selectedLift.name}</span>

                <div className="chart-period-toggle">
            <button
                className={chartPeriod === "week" ? "active" : ""}
                onClick={() => setChartPeriod("week")}
            >
                Vecka
            </button>

            <button
                className={chartPeriod === "month" ? "active" : ""}
                onClick={() => setChartPeriod("month")}
            >
                Månad
            </button>
        </div>
    </div>

        <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredStrengthData}>
                <XAxis dataKey="period" />
                <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                <Tooltip />

                <Line
                type="monotone"
                dataKey="weight"
                stroke="#b7ff00"
                strokeWidth={3}
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
    </section>
    </main>
    );
}

export default Statistics;