import { ueState } from "react";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <main>
      <h1>Kalender</h1>
      <p>Träningsdagar och träningspass</p>
    </main>
  );
}

export default Calendar;