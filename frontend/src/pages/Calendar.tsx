import { useState } from "react";
import "./Calendar.css";

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const previousMonth = () => {
  setCurrentDate(
    new Date(year, monthIndex - 1, 1)
  );
};

const nextMonth = () => {
  setCurrentDate(
    new Date(year, monthIndex + 1, 1)
  );
};

  const firstDay = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === monthIndex;
  const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const days = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
);

const emptyDays = Array.from(
  { length: startDay },
  () => null
);

const monthName = currentDate.toLocaleString("sv-SE", {
  month: "long",
});

const month =
  monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <main>
      <div className="calendarHeader">
  <button onClick={previousMonth}>‹</button>

  <h1>{month}</h1>

  <button onClick={nextMonth}>›</button>
</div>

    <div className="weekDays">
      <span>Mån</span>
      <span>Tis</span>
      <span>Ons</span>
      <span>Tor</span>
      <span>Fre</span>
      <span>Lör</span>
      <span>Sön</span>
    </div>
      
<div className="calendarGrid">
  {emptyDays.map((_, index) => (
    <div key={`empty-${index}`}></div>
  ))}

{days.map((day) => {
  const isToday = isCurrentMonth && day === today.getDate();

  return (
    <button
      key={day}
      className={isToday ? "today" : ""}
    >
      {day}
    </button>
  );
})}
</div>
    </main>
  );
}

export default Calendar;