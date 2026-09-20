import { useEffect, useState, type ReactNode } from "react";
import { MOCK_PROGRAMS } from "../mock/programs";
import {
  MockStateContext,
  type MockState,
  type MockStateValue,
} from "./mockState";

const STORAGE_KEY = "elevate-mock-state";

const DEFAULT_STATE: MockState = {
  level: 1,
  activeProgramId: null,
  doneCount: 0,
};

function loadState(): MockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw) as Partial<MockState>;
    const program = MOCK_PROGRAMS.find((p) => p.id === parsed.activeProgramId);

    return {
      level: [0, 1, 2].includes(parsed.level ?? -1)
        ? (parsed.level as number)
        : DEFAULT_STATE.level,
      activeProgramId: program ? program.id : null,
      doneCount: program
        ? Math.min(Math.max(parsed.doneCount ?? 0, 0), program.days.length)
        : 0,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function MockStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MockState>(loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // localStorage kan vara blockerat, det går bra utan
    }
  }, [state]);

  const value: MockStateValue = {
    state,
    setLevel: (level) => setState((s) => ({ ...s, level })),
    setActiveProgram: (programId) =>
      setState((s) => ({ ...s, activeProgramId: programId, doneCount: 0 })),
    setDoneCount: (count) =>
      setState((s) => {
        const program = MOCK_PROGRAMS.find((p) => p.id === s.activeProgramId);
        const max = program ? program.days.length : 0;
        return { ...s, doneCount: Math.min(Math.max(count, 0), max) };
      }),
    reset: () => setState(DEFAULT_STATE),
  };

  return (
    <MockStateContext.Provider value={value}>
      {children}
    </MockStateContext.Provider>
  );
}
