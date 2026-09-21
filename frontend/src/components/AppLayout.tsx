import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function AppLayout() {
  return (
    <>
      <main>
        <Outlet />
      </main>

      <Navbar />
    </>
  );
}

export default AppLayout;