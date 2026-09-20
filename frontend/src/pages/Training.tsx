import { Link, useNavigate } from "react-router-dom";
import { useMockState } from "../context/mockState";
import { MOCK_PROGRAMS } from "../mock/programs";
import "./training.css";

function Training() {
  const navigate = useNavigate();
  const { state, setDoneCount } = useMockState();

  const program =
    MOCK_PROGRAMS.find((p) => p.id === state.activeProgramId) ?? null;
  const dayCount = program ? program.days.length : 0;
  const finished = program !== null && state.doneCount >= dayCount;
  const nextDay =
    program && !finished ? program.days[state.doneCount % dayCount] : null;

  const startNext = () => {
    setDoneCount(state.doneCount + 1);
    navigate("/traning/pass");
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
    </main>
  );
}

export default Training;
