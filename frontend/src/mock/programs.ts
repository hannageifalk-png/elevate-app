/*
Mockdata för att kunna se programsidan utan backend.
Formen matchar vyn `program_overview` (se dokumentation/db/programmodell.sql),
så att sidorna kan byta till riktig data utan att ändras.
`schedule` motsvarar program_day > exercise_slot > set_template.
Tas bort när backend kopplas in.*/

import exampleProgram from "../assets/example-program.jpg";
import type { SetTemplate } from "../lib/program";

export type MockExercise = {
  name: string;
  sets: SetTemplate[];
};

export type MockDay = {
  name: string;
  exercises: MockExercise[];
};

export type MockProgram = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  app_user_role: number;
  recommended_sessions_per_week: number;
  program_type: string;
  week_count: number;
  exercise_count: number;
  equipment_label: string;
  days: string[];
  schedule: MockDay[];
};

const reps = (min: number, max = min): SetTemplate => ({
  reps_min: min,
  reps_max: max,
  duration_seconds: null,
});

const seconds = (duration: number): SetTemplate => ({
  reps_min: null,
  reps_max: null,
  duration_seconds: duration,
});

const times = (count: number, set: SetTemplate) =>
  Array.from({ length: count }, () => set);

const EXEMPEL_1: MockDay[] = [
  {
    name: "Dag 1 - Överkropp",
    exercises: [
      { name: "Latsdrag", sets: times(3, reps(10)) },
      { name: "Sittande kabelrodd", sets: times(3, reps(10)) },
      { name: "Axelpress med hantlar", sets: times(3, reps(10)) },
      { name: "Lateral raises med hantlar", sets: times(3, reps(12)) },
      { name: "Bröstpress i maskin", sets: times(3, reps(10)) },
      { name: "Triceps pushdown i kabel", sets: times(3, reps(12)) },
      { name: "Bicepscurl med hantlar", sets: times(3, reps(12)) },
      { name: "Cable crunch", sets: times(3, reps(15)) },
      { name: "Plankan", sets: times(3, seconds(45)) },
    ],
  },
  {
    name: "Dag 2 - Underkropp",
    exercises: [
      { name: "Knäböj med skivstång", sets: times(4, reps(8)) },
      { name: "Bulgariansk press med hantlar", sets: times(3, reps(10)) },
      { name: "Benpress", sets: times(3, reps(10)) },
      { name: "Rumänska Marklyft", sets: times(4, reps(10)) },
      { name: "Hip thrust", sets: times(4, reps(10)) },
      { name: "Vader i maskin", sets: times(4, reps(15)) },
      { name: "Dead bug", sets: times(3, reps(12)) },
      { name: "Sidoplankan", sets: times(3, seconds(30)) },
    ],
  },
  {
    name: "Dag 3 - Överkropp",
    exercises: [
      { name: "Latsdrag", sets: times(3, reps(10)) },
      { name: "Axelpress med hantlar", sets: times(3, reps(10)) },
      { name: "Sittande kabelrodd", sets: times(3, reps(10)) },
      { name: "Lutande Bänkpress med hantlar", sets: times(3, reps(10)) },
      { name: "Bicepscurl med hantlar", sets: times(3, reps(12)) },
      { name: "Triceps pushdown i kabel", sets: times(3, reps(12)) },
    ],
  },
];

const EXEMPEL_2: MockDay[] = [
  {
    name: "Dag 1 - Push",
    exercises: [
      { name: "Bänkpress", sets: [reps(6, 8), reps(8, 10), reps(10, 12)] },
      { name: "Axelpress med skivstång", sets: times(3, reps(8, 10)) },
      { name: "Lateral raises med kabel", sets: times(3, reps(10, 15)) },
      { name: "Facepull", sets: times(2, reps(10, 15)) },
      {
        name: "Triceps pushdown med rep i kabel",
        sets: [reps(8, 12), reps(10, 12), reps(12, 15)],
      },
      { name: "Bröstflies med maskin", sets: times(2, reps(12, 15)) },
    ],
  },
  {
    name: "Dag 2 - Ben",
    exercises: [
      {
        name: "Knäböj med skivstång",
        sets: [reps(6, 8), reps(8, 10), reps(10, 12)],
      },
      { name: "Rumänska Marklyft", sets: times(2, reps(8, 10)) },
      {
        name: "Benspark i maskin",
        sets: [reps(8, 10), reps(10, 12), reps(12, 15)],
      },
      {
        name: "Bencurl i maskin",
        sets: [reps(8, 10), reps(10, 12), reps(12, 15)],
      },
      { name: "Vader i benpress", sets: times(3, reps(12, 15)) },
    ],
  },
  {
    name: "Dag 3 - Push",
    exercises: [
      {
        name: "Axelpress med skivstång",
        sets: [reps(6, 8), reps(8, 10), reps(10, 12)],
      },
      { name: "Bänkpress", sets: times(3, reps(8, 10)) },
      { name: "Lateral raises med hantlar", sets: times(3, reps(10, 15)) },
      { name: "Baksida axel i kabel", sets: times(2, reps(10, 15)) },
      {
        name: "Triceps extension med hantel bakom huvudet",
        sets: [reps(8, 12), reps(10, 12), reps(12, 15)],
      },
      { name: "Bröstflies med hantlar", sets: times(2, reps(12, 15)) },
    ],
  },
  {
    name: "Dag 4 - Pull",
    exercises: [
      { name: "Marklyft", sets: [reps(6, 8), reps(8, 10), reps(10, 12)] },
      { name: "Latsdrag", sets: [reps(8, 10), reps(10, 12), reps(12, 15)] },
      {
        name: "Sittande kabelrodd",
        sets: [reps(8, 10), reps(10, 12), reps(12, 15)],
      },
      { name: "Bicepscurl med hantlar", sets: times(3, reps(8, 12)) },
      {
        name: "Triceps pushdown med rep i kabel",
        sets: times(3, reps(8, 12)),
      },
    ],
  },
];

export const MOCK_PROGRAMS: MockProgram[] = [
  {
    id: "mock-exempel-1",
    name: "Exempel 1",
    description:
      "Helkroppsprogram med tre pass i veckan: överkropp, underkropp, överkropp.",
    image_url: exampleProgram,
    app_user_role: 1,
    recommended_sessions_per_week: 3,
    program_type: "Allmänt program",
    week_count: 1,
    exercise_count: 18,
    equipment_label: "Gym",
    days: EXEMPEL_1.map((day) => day.name),
    schedule: EXEMPEL_1,
  },
  {
    id: "mock-exempel-2",
    name: "Exempel 2",
    description: "Push/ben/push/pull med fyra pass i veckan.",
    image_url: exampleProgram,
    app_user_role: 2,
    recommended_sessions_per_week: 4,
    program_type: "Kroppsbyggande",
    week_count: 1,
    exercise_count: 19,
    equipment_label: "Gym",
    days: EXEMPEL_2.map((day) => day.name),
    schedule: EXEMPEL_2,
  },
];
