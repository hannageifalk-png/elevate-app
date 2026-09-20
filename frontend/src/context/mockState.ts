import { createContext, useContext } from "react";

// Låtsasläge för att testa programsidan utan backend.
// Ändras med AdminPanel. Tas bort när riktig data kopplas in.

export type MockState = {
  level: number; // 0 Free, 1 Standard, 2 Premium
  activeProgramId: string | null;
  doneCount: number; // antal pass gjorda i det aktiva programmet
};

export type MockStateValue = {
  state: MockState;
  setLevel: (level: number) => void;
  setActiveProgram: (programId: string | null) => void;
  setDoneCount: (count: number) => void;
  reset: () => void;
};

export const MockStateContext = createContext<MockStateValue | null>(null);

export function useMockState() {
  const value = useContext(MockStateContext);

  if (!value) {
    throw new Error("useMockState måste användas inom MockStateProvider");
  }

  return value;
}
