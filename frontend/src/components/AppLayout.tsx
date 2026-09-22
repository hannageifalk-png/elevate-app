import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <>
      <main className="app-content">
        <Outlet />
      </main>

      <Navbar />
    </>
  );
}

export default AppLayout;