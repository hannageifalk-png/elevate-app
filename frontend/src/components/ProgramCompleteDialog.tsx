import "./ProgramCompleteDialog.css";

type ProgramCompleteDialogProps = {
  programName: string;
  onRestart: () => void;
  onBrowse: () => void;
  onContinue: () => void;
  pending?: boolean;
};

function ProgramCompleteDialog({
  programName,
  onRestart,
  onBrowse,
  onContinue,
  pending = false,
}: ProgramCompleteDialogProps) {
  return (
    <div className="dialog-overlay">
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Programmet är avklarat"
      >
        <h2>Du har klarat {programName}</h2>
        <p>Alla pass i programmet är gjorda. Vad vill du göra nu?</p>

        <button type="button" onClick={onRestart} disabled={pending} autoFocus>
          Kör programmet igen
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={onBrowse}
          disabled={pending}
        >
          Bläddra bland färdiga program
        </button>
        <button
          type="button"
          className="btn-quiet"
          onClick={onContinue}
          disabled={pending}
        >
          Gå vidare
        </button>
      </div>
    </div>
  );
}

export default ProgramCompleteDialog;
