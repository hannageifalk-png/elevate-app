import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <>
      <div className="app-content">
        <Outlet />
      </div>

      <Navbar />
    </>
  );
}

export default AppLayout;