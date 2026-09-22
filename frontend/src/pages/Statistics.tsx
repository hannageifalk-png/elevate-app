import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

import "./Statistics.css";

const lifts = [
  {
    name: "Bänkpress",
    max: 100,
    records: [100, 95, 90, 87.5, 85],
  },
  {
    name: "Knäböj",
    max: 140,
    records: [140, 132.5, 125, 120, 115],
  },
  {
    name: "Marklyft",
    max: 180,
    records: [180, 170, 162.5, 155, 150],
  },
  {
    name: "Militärpress",
    max: 70,
    records: [70, 65, 60, 57.5, 55],
  },
];

const overviewData = {
  week: {
    workouts: 4,
    personalRecords: 2,
    trainingDays: 4,
  },
  month: {
    workouts: 14,
    personalRecords: 5,
    trainingDays: 11,
  },
};

const strengthData = [
  { period: "V35", weight: 85 },
  { period: "V36", weight: 87.5 },
  { period: "V37", weight: 90 },
  { period: "V38", weight: 92.5 },
  { period: "V39", weight: 100 },
];

function Statistics() {
  const { profile } = useAuth();

  const [selectedLift, setSelectedLift] = useState(lifts[0]);
  const [period, setPeriod] = useState<"week" | "month">("week");

  const [chartPeriod, setChartPeriod] =
  useState<"week" | "month">("week");

  const overview = overviewData[period];

  if (!profile) {
    return <p>Laddar...</p>;
  }

  const hasStatisticsAccess = profile.role === 2 || profile.role === 3;

  if (!hasStatisticsAccess) {
    return (
      <main>
        <h1>Följ mina framsteg</h1>

        <h2>Premiumfunktion</h2>

        <p>
          Uppgradera till Premium för att följa din styrkeutveckling,
          se dina personbästa och jämföra din träning över tid.
        </p>
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
                <strong>{overview.workouts}</strong>
                <span>Pass</span>
                </div>

                <div className="overview-card">
                <strong>{overview.personalRecords}</strong>
                <span>Personbästa</span>
                </div>

                <div className="overview-card">
                <strong>{overview.trainingDays}</strong>
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
                <strong>{lift.max} kg</strong>
            </button>
            ))}
        </div>

        <div className="rm-card">
            <h3>{selectedLift.name}</h3>

            <div className="rm-list">
                {selectedLift.records.map((weight, index) => (
                <div className="rm-row" key={index}>
                    <span>{index + 1}RM</span>
                    <strong>{weight} kg</strong>
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
            <LineChart data={strengthData}>
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