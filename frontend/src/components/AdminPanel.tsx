import { useState } from "react";
import { MEMBERSHIP_NAMES } from "../constants/membership";
import { useMockState } from "../context/mockState";
import { MOCK_PROGRAMS } from "../mock/programs";
import "./AdminPanel.css";

// Testpanel för att byta låtsasläge (nivå, aktivt program, gjorda pass) medan
// sidorna byggs. Visas bara i utvecklingsläge. Tas bort när backend kopplas in.

const LEVELS = [0, 1, 2];

function AdminPanel() {
  const [open, setOpen] = useState(false);
  const { state, setLevel, setActiveProgram, setDoneCount, reset } =
    useMockState();

  const program =
    MOCK_PROGRAMS.find((p) => p.id === state.activeProgramId) ?? null;
  const dayCount = program ? program.days.length : 0;
  const finished = program !== null && state.doneCount >= dayCount;
  const nextDay =
    program && !finished ? program.days[state.doneCount % dayCount] : null;

  const choice = (selected: boolean) => (selected ? "" : "btn-ghost");

  if (!open) {
    return (
      <button
        type="button"
        className="admin-panel-toggle"
        onClick={() => setOpen(true)}
      >
        Testpanel
      </button>
    );
  }

  return (
    <aside className="admin-panel" aria-label="Testpanel">
      <div className="row row-between">
        <h3>Testpanel</h3>
        <button
          type="button"
          className="btn-quiet"
          onClick={() => setOpen(false)}
        >
          Stäng
        </button>
      </div>

      <div className="admin-panel-group">
        <p className="eyebrow">Medlemsnivå</p>
        <div className="admin-panel-choices">
          {LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={choice(state.level === level)}
              onClick={() => setLevel(level)}
            >
              {MEMBERSHIP_NAMES[level]}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel-group">
        <p className="eyebrow">Aktivt program</p>
        <div className="admin-panel-choices">
          <button
            type="button"
            className={choice(program === null)}
            onClick={() => setActiveProgram(null)}
          >
            Inget
          </button>
          {MOCK_PROGRAMS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={choice(state.activeProgramId === p.id)}
              onClick={() => setActiveProgram(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {program && (
        <div className="admin-panel-group">
          <p className="eyebrow">Pass gjorda</p>
          <div className="admin-panel-choices">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setDoneCount(state.doneCount - 1)}
              disabled={state.doneCount <= 0}
            >
              −
            </button>
            <span className="admin-panel-value">
              {state.doneCount} av {dayCount}
            </span>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setDoneCount(state.doneCount + 1)}
              disabled={finished}
            >
              +
            </button>
          </div>
          <p>
            {finished
              ? "Programmet är avklarat"
              : `Nästa pass: ${nextDay}`}
          </p>
        </div>
      )}

      <button type="button" className="btn-quiet" onClick={reset}>
        Återställ
      </button>
    </aside>
  );
}

export default AdminPanel;
