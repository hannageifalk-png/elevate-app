import { Link, useNavigate } from "react-router-dom";
import ProgramCompleteDialog from "../components/ProgramCompleteDialog";
import { useMockState } from "../context/mockState";
import { dayToPassExercises } from "../lib/program";
import { MOCK_PROGRAMS } from "../mock/programs";
import "./training.css";

function Training() {
  const navigate = useNavigate();
  const { state, setActiveProgram, setDoneCount } = useMockState();

  const program =
    MOCK_PROGRAMS.find((p) => p.id === state.activeProgramId) ?? null;
  const dayCount = program ? program.days.length : 0;
  const finished = program !== null && state.doneCount >= dayCount;
  const nextDay =
    program && !finished ? program.days[state.doneCount % dayCount] : null;

  const startNext = () => {
    if (!program) return;

    const day = program.schedule[state.doneCount % dayCount];
    setDoneCount(state.doneCount + 1);
    navigate("/traning/pass", {
      state: {
        sessionName: `${program.name} · ${day.name}`,
        exercises: dayToPassExercises(day.exercises),
      },
    });
  };

  const restart = () => {
    if (program) setActiveProgram(program.id);
  };

  const leave = () => setActiveProgram(null);

  const browse = () => {
    leave();
    navigate("/traning/program");
  };

  return (
    <main>
      <h1>Träning</h1>

      {program ? (
        <button
          type="button"
          className="btn-large"
          onClick={startNext}
          disabled={finished}
        >
          {finished
            ? `${program.name} är avklarat`
            : `Starta nästa pass i ${program.name}`}
          {nextDay && <small>{nextDay}</small>}
        </button>
      ) : (
        <button
          type="button"
          className="btn-large"
          onClick={() => navigate("/traning/program")}
        >
          Välj ett program
        </button>
      )}

      <button
        type="button"
        className="btn-large btn-ghost"
        onClick={() => navigate("/traning/dagens")}
      >
        Skapa ditt eget pass
      </button>

      {program && (
        <Link to={`/traning/program/${program.id}`}>
          Visa {program.name}
        </Link>
      )}

      {program && finished && (
        <ProgramCompleteDialog
          programName={program.name}
          onRestart={restart}
          onBrowse={browse}
          onContinue={leave}
        />
      )}
    </main>
  );
}

export default Training;
