import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Membership from "./pages/Membership";
import Training from "./pages/Training";
import ProgramList from "./pages/ProgramList";
import ProgramDetail from "./pages/ProgramDetail";
import ComingSoon from "./pages/ComingSoon";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
      <Route path="/membership" element={<ProtectedRoute><Membership /></ProtectedRoute>}/>

      <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
        <Route path="/traning" element={<Training />} />
        <Route path="/traning/program" element={<ProgramList />} />
        <Route path="/traning/program/:programId" element={<ProgramDetail />} />
        <Route path="/traning/dagens" element={<ComingSoon title="Skapa ditt eget pass" />} />
        <Route path="/traning/pass" element={<ComingSoon title="Ditt pass" />} />
      </Route>
    </Routes>
  );
}

export default App;
