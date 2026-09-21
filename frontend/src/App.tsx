import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Membership from "./pages/Membership";
import Training from "./pages/Training";
import ComingSoon from "./pages/ComingSoon";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><AppLayout/></ProtectedRoute>}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/membership" element={<ProtectedRoute><Membership /></ProtectedRoute>}/>
      </Route>

        <Route path="/traning" element={<Training />} />
        <Route path="/traning/program" element={<ComingSoon title="Välj ett program" />} />
        <Route path="/traning/program/:programId" element={<ComingSoon title="Program" />} />
        <Route path="/traning/dagens" element={<ComingSoon title="Skapa ditt eget pass" />} />
        <Route path="/traning/pass" element={<ComingSoon title="Ditt pass" />} />
    </Routes>
  );
}

export default App;
