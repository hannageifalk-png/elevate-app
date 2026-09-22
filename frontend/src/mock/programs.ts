/* 
Mockdata för att kunna se programsidan utan backend.
Formen matchar vyn `program_overview` (se dokumentation/db/programmodell.sql), 
så att sidorna kan byta till riktig data utan att ändras.
Tas bort när backend kopplas in.*/


export type MockProgram = {
  id: string;
  name: string;
  description: string;
  app_user_role: number; 
  recommended_sessions_per_week: number;
  program_type: string;
  week_count: number; 
  exercise_count: number;
  equipment_label: string;
  days: string[];
};

export const MOCK_PROGRAMS: MockProgram[] = [
  {
    id: "mock-exempel-1",
    name: "Exempel 1",
    description:
      "Helkroppsprogram med tre pass i veckan: överkropp, underkropp, överkropp.",
    app_user_role: 1,
    recommended_sessions_per_week: 3,
    program_type: "Allmänt program",
    week_count: 1,
    exercise_count: 18,
    equipment_label: "Gym",
    days: ["Dag 1 - Överkropp", "Dag 2 - Underkropp", "Dag 3 - Överkropp"],
  },
  {
    id: "mock-exempel-2",
    name: "Exempel 2",
    description: "Push/ben/push/pull med fyra pass i veckan.",
    app_user_role: 2,
    recommended_sessions_per_week: 4,
    program_type: "Kroppsbyggande",
    week_count: 1,
    exercise_count: 19,
    equipment_label: "Gym",
    days: ["Dag 1 - Push", "Dag 2 - Ben", "Dag 3 - Push", "Dag 4 - Pull"],
  },
];
