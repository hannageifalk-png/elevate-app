/*
Övningskatalog för mockläget, till "Skapa ditt eget pass". Byggd ur
dokumentation/db/exercise_rows.json och exercise_muscle_rows.json (exporterat
ur Supabase 2026-09-20), plus de fyra övningarna som importera_scheman.sql
lägger till (Hip thrust m.fl.).

muskel-id -> namn finns inte som egen exportfil, så kopplingen är härledd genom
att jämföra varje övnings muskel-id mot dess beskrivning och rörelsemönster
(t.ex. "Vader med skivstång" -> muskel-id 7 i alla vadövningar -> Vader).

Sju övningar saknade muskelkoppling i exportfilen, tre av dem används i de
riktiga programmen (Sittande kabelrodd, Lutande Bänkpress med hantlar, Vader
i maskin). Utan koppling går de inte att hitta via övningsväljaren, så de är
ifyllda efter en syskonövning med identisk rörelse (kommentar vid varje
nedan). Värt att kontrollera om samma lucka finns i Supabase, se
05-status.md.

Tas bort när backend kopplas in.
*/

export type MuscleRole = "primary" | "secondary";

export type ExerciseMuscle = {
  muscle: string;
  role: MuscleRole;
};

export type CatalogExercise = {
  id: string;
  name: string;
  equipment: string;
  movement_pattern: string;
  measure_type: "reps" | "time";
  muscles: ExerciseMuscle[];
};

export type MuscleGroup = {
  name: string;
  muscles: string[];
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  { name: "Armar", muscles: ["Biceps", "Triceps", "Underarmar"] },
  { name: "Ben", muscles: ["Quadriceps", "Hamstrings", "Glutes", "Vader"] },
  { name: "Rygg", muscles: ["Rhomboids", "Latissimus", "Traps"] },
  { name: "Axlar", muscles: ["Framsida axel", "Mitt axel", "Baksida axel"] },
  { name: "Core", muscles: ["Mage", "Ländryggen"] },
  { name: "Bröst", muscles: ["Bröst"] },
];

export const EXERCISE_CATALOG: CatalogExercise[] = [
  {
    id: "axelpress-i-maskin",
    name: "Axelpress i maskin",
    equipment: "machine",
    movement_pattern: "push",
    measure_type: "reps",
    muscles: [
      { muscle: "Framsida axel", role: "primary" },
      { muscle: "Triceps", role: "secondary" },
      { muscle: "Mitt axel", role: "secondary" },
    ],
  },
  {
    id: "axelpress-med-hantlar",
    name: "Axelpress med hantlar",
    equipment: "dumbbell",
    movement_pattern: "push",
    measure_type: "reps",
    muscles: [
      { muscle: "Framsida axel", role: "primary" },
      { muscle: "Triceps", role: "secondary" },
      { muscle: "Mitt axel", role: "secondary" },
    ],
  },
  {
    id: "axelpress-med-skivstang",
    name: "Axelpress med skivstång",
    equipment: "barbell",
    movement_pattern: "push",
    measure_type: "reps",
    muscles: [
      { muscle: "Framsida axel", role: "primary" },
      { muscle: "Triceps", role: "secondary" },
      { muscle: "Mitt axel", role: "secondary" },
    ], // som Axelpress med hantlar / i maskin
  },
  {
    id: "baksida-axel-i-kabel",
    name: "Baksida axel i kabel",
    equipment: "cable",
    movement_pattern: "pull_horizontal",
    measure_type: "reps",
    muscles: [
      { muscle: "Baksida axel", role: "primary" },
      { muscle: "Rhomboids", role: "secondary" },
    ],
  },
  {
    id: "bencurl-i-maskin",
    name: "Bencurl i maskin",
    equipment: "machine",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Hamstrings", role: "primary" }],
  },
  {
    id: "benpress",
    name: "Benpress",
    equipment: "machine",
    movement_pattern: "squat",
    measure_type: "reps",
    muscles: [
      { muscle: "Quadriceps", role: "primary" },
      { muscle: "Hamstrings", role: "secondary" },
      { muscle: "Glutes", role: "secondary" },
    ],
  },
  {
    id: "benspark-i-maskin",
    name: "Benspark i maskin",
    equipment: "machine",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Quadriceps", role: "primary" }],
  },
  {
    id: "bicepscurl-i-kabel",
    name: "Bicepscurl i kabel",
    equipment: "cable",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [
      { muscle: "Biceps", role: "primary" },
      { muscle: "Underarmar", role: "secondary" },
    ],
  },
  {
    id: "bicepscurl-med-hantlar",
    name: "Bicepscurl med hantlar",
    equipment: "dumbbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [
      { muscle: "Biceps", role: "primary" },
      { muscle: "Underarmar", role: "secondary" },
    ],
  },
  {
    id: "bicepscurl-med-skivstang",
    name: "Bicepscurl med skivstång",
    equipment: "barbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [
      { muscle: "Biceps", role: "primary" },
      { muscle: "Underarmar", role: "secondary" },
    ],
  },
  {
    id: "bird-dog",
    name: "Bird-dog",
    equipment: "bodyweight",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [
      { muscle: "Ländryggen", role: "primary" },
      { muscle: "Glutes", role: "secondary" },
      { muscle: "Mage", role: "secondary" },
    ],
  },
  {
    id: "brostflies-med-hantlar",
    name: "Bröstflies med hantlar",
    equipment: "dumbbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [
      { muscle: "Bröst", role: "primary" },
      { muscle: "Framsida axel", role: "secondary" },
    ],
  },
  {
    id: "brostflies-med-maskin",
    name: "Bröstflies med maskin",
    equipment: "machine",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [
      { muscle: "Bröst", role: "primary" },
      { muscle: "Framsida axel", role: "secondary" },
    ],
  },
  {
    id: "brostpress-i-maskin",
    name: "Bröstpress i maskin",
    equipment: "machine",
    movement_pattern: "push",
    measure_type: "reps",
    muscles: [
      { muscle: "Bröst", role: "primary" },
      { muscle: "Triceps", role: "secondary" },
      { muscle: "Framsida axel", role: "secondary" },
    ],
  },
  {
    id: "bulgariansk-press-med-hantlar",
    name: "Bulgariansk press med hantlar",
    equipment: "dumbbell",
    movement_pattern: "squat",
    measure_type: "reps",
    muscles: [
      { muscle: "Quadriceps", role: "primary" },
      { muscle: "Hamstrings", role: "secondary" },
      { muscle: "Glutes", role: "secondary" },
    ],
  },
  {
    id: "bulgariansk-press-med-skivstang",
    name: "Bulgariansk press med skivstång",
    equipment: "barbell",
    movement_pattern: "squat",
    measure_type: "reps",
    muscles: [
      { muscle: "Quadriceps", role: "primary" },
      { muscle: "Hamstrings", role: "secondary" },
      { muscle: "Glutes", role: "secondary" },
    ],
  },
  {
    id: "bankpress",
    name: "Bänkpress",
    equipment: "barbell",
    movement_pattern: "push",
    measure_type: "reps",
    muscles: [
      { muscle: "Bröst", role: "primary" },
      { muscle: "Triceps", role: "secondary" },
      { muscle: "Framsida axel", role: "secondary" },
    ],
  },
  {
    id: "cable-crunch",
    name: "Cable crunch",
    equipment: "cable",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Mage", role: "primary" }], // som Situps / Dead bug
  },
  {
    id: "dead-bug",
    name: "Dead bug",
    equipment: "bodyweight",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Mage", role: "primary" }],
  },
  {
    id: "dips",
    name: "Dips",
    equipment: "bodyweight",
    movement_pattern: "push",
    measure_type: "reps",
    muscles: [
      { muscle: "Bröst", role: "primary" },
      { muscle: "Triceps", role: "secondary" },
      { muscle: "Framsida axel", role: "secondary" },
    ],
  },
  {
    id: "facepull",
    name: "Facepull",
    equipment: "cable",
    movement_pattern: "pull_horizontal",
    measure_type: "reps",
    muscles: [
      { muscle: "Baksida axel", role: "primary" },
      { muscle: "Rhomboids", role: "secondary" },
      { muscle: "Traps", role: "secondary" },
    ],
  },
  {
    id: "front-raises-med-hantlar",
    name: "Front raises med hantlar",
    equipment: "dumbbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Framsida axel", role: "primary" }],
  },
  {
    id: "front-raises-med-kabel",
    name: "Front raises med kabel",
    equipment: "cable",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Framsida axel", role: "primary" }],
  },
  {
    id: "frontboj-med-skivstang",
    name: "Frontböj med skivstång",
    equipment: "barbell",
    movement_pattern: "squat",
    measure_type: "reps",
    muscles: [
      { muscle: "Quadriceps", role: "primary" },
      { muscle: "Glutes", role: "secondary" },
      { muscle: "Mage", role: "secondary" },
    ],
  },
  {
    id: "hantelrodd",
    name: "Hantelrodd",
    equipment: "dumbbell",
    movement_pattern: "pull_horizontal",
    measure_type: "reps",
    muscles: [
      { muscle: "Latissimus", role: "primary" },
      { muscle: "Biceps", role: "secondary" },
      { muscle: "Rhomboids", role: "secondary" },
    ], // som Stående hantelrodd
  },
  {
    id: "hip-thrust",
    name: "Hip thrust",
    equipment: "barbell",
    movement_pattern: "hinge",
    measure_type: "reps",
    muscles: [
      { muscle: "Glutes", role: "primary" },
      { muscle: "Hamstrings", role: "secondary" },
    ],
  },
  {
    id: "hangande-benlyft",
    name: "Hängande benlyft",
    equipment: "bodyweight",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Mage", role: "primary" }],
  },
  {
    id: "hangande-knalyft",
    name: "Hängande knälyft",
    equipment: "bodyweight",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Mage", role: "primary" }],
  },
  {
    id: "knaboj-med-skivstang",
    name: "Knäböj med skivstång",
    equipment: "barbell",
    movement_pattern: "squat",
    measure_type: "reps",
    muscles: [
      { muscle: "Quadriceps", role: "primary" },
      { muscle: "Hamstrings", role: "secondary" },
      { muscle: "Glutes", role: "secondary" },
      { muscle: "Ländryggen", role: "secondary" },
    ],
  },
  {
    id: "lat-pullover",
    name: "Lat pullover",
    equipment: "cable",
    movement_pattern: "pull_vertical",
    measure_type: "reps",
    muscles: [
      { muscle: "Latissimus", role: "primary" },
      { muscle: "Bröst", role: "secondary" },
    ],
  },
  {
    id: "lateral-raises-med-hantlar",
    name: "Lateral raises med hantlar",
    equipment: "dumbbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Mitt axel", role: "primary" }],
  },
  {
    id: "lateral-raises-med-kabel",
    name: "Lateral raises med kabel",
    equipment: "cable",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Mitt axel", role: "primary" }],
  },
  {
    id: "latsdrag",
    name: "Latsdrag",
    equipment: "cable",
    movement_pattern: "pull_vertical",
    measure_type: "reps",
    muscles: [
      { muscle: "Latissimus", role: "primary" },
      { muscle: "Biceps", role: "secondary" },
    ],
  },
  {
    id: "latsdrag-en-arm",
    name: "Latsdrag en arm",
    equipment: "cable",
    movement_pattern: "pull_vertical",
    measure_type: "reps",
    muscles: [
      { muscle: "Latissimus", role: "primary" },
      { muscle: "Biceps", role: "secondary" },
    ], // som Latsdrag
  },
  {
    id: "liggande-bencurl",
    name: "Liggande bencurl",
    equipment: "machine",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Hamstrings", role: "primary" }],
  },
  {
    id: "lutande-bankpress",
    name: "Lutande Bänkpress",
    equipment: "barbell",
    movement_pattern: "push",
    measure_type: "reps",
    muscles: [
      { muscle: "Bröst", role: "primary" },
      { muscle: "Triceps", role: "secondary" },
      { muscle: "Framsida axel", role: "secondary" },
    ],
  },
  {
    id: "lutande-bankpress-med-hantlar",
    name: "Lutande Bänkpress med hantlar",
    equipment: "dumbbell",
    movement_pattern: "push",
    measure_type: "reps",
    muscles: [
      { muscle: "Bröst", role: "primary" },
      { muscle: "Triceps", role: "secondary" },
      { muscle: "Framsida axel", role: "secondary" },
    ], // som Lutande Bänkpress
  },
  {
    id: "marklyft",
    name: "Marklyft",
    equipment: "barbell",
    movement_pattern: "hinge",
    measure_type: "reps",
    muscles: [
      { muscle: "Hamstrings", role: "primary" },
      { muscle: "Quadriceps", role: "secondary" },
      { muscle: "Glutes", role: "secondary" },
      { muscle: "Traps", role: "secondary" },
      { muscle: "Ländryggen", role: "secondary" },
    ],
  },
  {
    id: "plankan",
    name: "Plankan",
    equipment: "bodyweight",
    movement_pattern: "isolation",
    measure_type: "time",
    muscles: [
      { muscle: "Mage", role: "primary" },
      { muscle: "Ländryggen", role: "secondary" },
    ],
  },
  {
    id: "pronerad-hantellyft-for-underarmar",
    name: "Pronerad hantellyft för underarmar",
    equipment: "dumbbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Underarmar", role: "primary" }],
  },
  {
    id: "pullups",
    name: "Pullups",
    equipment: "bodyweight",
    movement_pattern: "pull_vertical",
    measure_type: "reps",
    muscles: [
      { muscle: "Latissimus", role: "primary" },
      { muscle: "Biceps", role: "secondary" },
      { muscle: "Rhomboids", role: "secondary" },
    ],
  },
  {
    id: "rumanska-marklyft",
    name: "Rumänska Marklyft",
    equipment: "barbell",
    movement_pattern: "hinge",
    measure_type: "reps",
    muscles: [
      { muscle: "Hamstrings", role: "primary" },
      { muscle: "Glutes", role: "secondary" },
      { muscle: "Ländryggen", role: "secondary" },
    ],
  },
  {
    id: "shrugs-med-hantlar",
    name: "Shrugs med hantlar",
    equipment: "dumbbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Traps", role: "primary" }],
  },
  {
    id: "shrugs-med-skivstang",
    name: "Shrugs med skivstång",
    equipment: "barbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Traps", role: "primary" }],
  },
  {
    id: "sidoplankan",
    name: "Sidoplankan",
    equipment: "bodyweight",
    movement_pattern: "isolation",
    measure_type: "time",
    muscles: [{ muscle: "Mage", role: "primary" }],
  },
  {
    id: "sittande-kabelrodd",
    name: "Sittande kabelrodd",
    equipment: "cable",
    movement_pattern: "pull_horizontal",
    measure_type: "reps",
    muscles: [
      { muscle: "Latissimus", role: "primary" },
      { muscle: "Biceps", role: "secondary" },
      { muscle: "Rhomboids", role: "secondary" },
    ], // som Sittande maskinrodd
  },
  {
    id: "sittande-maskinrodd",
    name: "Sittande maskinrodd",
    equipment: "machine",
    movement_pattern: "pull_horizontal",
    measure_type: "reps",
    muscles: [
      { muscle: "Latissimus", role: "primary" },
      { muscle: "Biceps", role: "secondary" },
      { muscle: "Rhomboids", role: "secondary" },
    ],
  },
  {
    id: "situps",
    name: "Situps",
    equipment: "bodyweight",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Mage", role: "primary" }],
  },
  {
    id: "staende-hantelrodd",
    name: "Stående hantelrodd",
    equipment: "dumbbell",
    movement_pattern: "pull_horizontal",
    measure_type: "reps",
    muscles: [
      { muscle: "Latissimus", role: "primary" },
      { muscle: "Biceps", role: "secondary" },
      { muscle: "Rhomboids", role: "secondary" },
    ],
  },
  {
    id: "staende-skivstangsrodd",
    name: "Stående skivstångsrodd",
    equipment: "barbell",
    movement_pattern: "pull_horizontal",
    measure_type: "reps",
    muscles: [
      { muscle: "Latissimus", role: "primary" },
      { muscle: "Biceps", role: "secondary" },
      { muscle: "Rhomboids", role: "secondary" },
      { muscle: "Ländryggen", role: "secondary" },
    ],
  },
  {
    id: "supinerad-hantellyft-for-underarmar",
    name: "Supinerad hantellyft för underarmar",
    equipment: "dumbbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Underarmar", role: "primary" }],
  },
  {
    id: "triceps-extension-med-hantel-bakom-huvudet",
    name: "Triceps extension med hantel bakom huvudet",
    equipment: "dumbbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Triceps", role: "primary" }],
  },
  {
    id: "triceps-extension-med-skivstang-bakom-huvudet",
    name: "Triceps extension med skivstång bakom huvudet",
    equipment: "barbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Triceps", role: "primary" }],
  },
  {
    id: "triceps-pushdown-i-kabel",
    name: "Triceps pushdown i kabel",
    equipment: "cable",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Triceps", role: "primary" }],
  },
  {
    id: "triceps-pushdown-med-rep-i-kabel",
    name: "Triceps pushdown med rep i kabel",
    equipment: "cable",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Triceps", role: "primary" }],
  },
  {
    id: "vader-i-benpress",
    name: "Vader i benpress",
    equipment: "machine",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Vader", role: "primary" }],
  },
  {
    id: "vader-i-maskin",
    name: "Vader i maskin",
    equipment: "machine",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Vader", role: "primary" }], // som Vader med skivstång / med hantlar / i smithmaskin
  },
  {
    id: "vader-i-smithmaskin",
    name: "Vader i smithmaskin",
    equipment: "machine",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Vader", role: "primary" }],
  },
  {
    id: "vader-med-hantlar",
    name: "Vader med hantlar",
    equipment: "dumbbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Vader", role: "primary" }],
  },
  {
    id: "vader-med-skivstang",
    name: "Vader med skivstång",
    equipment: "barbell",
    movement_pattern: "isolation",
    measure_type: "reps",
    muscles: [{ muscle: "Vader", role: "primary" }],
  },
];
