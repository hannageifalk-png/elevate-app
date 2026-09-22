import { NavLink } from "react-router-dom";
import {
  House,
  ChartNoAxesColumnIncreasing,
  Play,
  CalendarDays,
  UserRound,
} from "lucide-react";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <NavLink
        to="/"
        className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
        }
        >
            <House />
            <span>Start</span>
        </NavLink>

      <NavLink to="/statistics" className="nav-item">
        <ChartNoAxesColumnIncreasing />
        <span>Följ mina framsteg</span>
      </NavLink>

      <NavLink to="/traning" className="nav-item training-item">
        <div className="training-button">
          <Play fill="currentColor" />
        </div>
        <span>Träning</span>
      </NavLink>

      <NavLink to="/calendar" className="nav-item">
        <CalendarDays />
        <span>Kalender</span>
      </NavLink>

      <NavLink to="/account" className="nav-item">
        <UserRound />
        <span>Mitt konto</span>
      </NavLink>
    </nav>
  );
}

export default Navbar;