import { NavLink } from "react-router-dom";
import "./AdminNav.css";

function AdminNav() {
  return (
    <nav className="row admin-nav">
      <NavLink
        to="/admin/exercises"
        className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
      >
        Övningar
      </NavLink>
      <NavLink
        to="/admin/programs"
        className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}
      >
        Program
      </NavLink>
    </nav>
  );
}

export default AdminNav;
