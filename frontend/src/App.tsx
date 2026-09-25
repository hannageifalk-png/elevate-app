import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import Membership from "./pages/Membership";
import Calendar from "./pages/Calendar";
import Training from "./pages/Training";
import ProgramList from "./pages/ProgramList";
import ProgramDetail from "./pages/ProgramDetail";
import OwnSession from "./pages/OwnSession";
import PassSession from "./pages/PassSession";
import AppLayout from "./components/AppLayout";
import Statistics from "./pages/Statistics";
import MyAccount from "./pages/MyAccount";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        
        <Route path="/home" element={<HomePage />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/my-account" element={<MyAccount />} />
        <Route path="/traning" element={<Training />} />
        <Route path="/traning/program" element={<ProgramList />} />
        <Route path="/traning/program/:programId" element={<ProgramDetail />} />
        <Route path="/traning/dagens" element={<OwnSession />} />
        <Route path="/traning/pass" element={<PassSession />} />
      </Route>
    </Routes>
  );
}

export default App;