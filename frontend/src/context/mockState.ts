import { createContext, useContext } from "react";

export type MockState = {
  level: number | null;
  activeProgramId: string | null;
  doneCount: number;
};

export type MockStateValue = {
  state: MockState;
  setLevel: (level: number | null) => void;
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
