import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Membership from "./pages/Membership";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/> 
      <Route path="/membership" element={<ProtectedRoute><Membership /></ProtectedRoute>}/>
    </Routes>
  );
}

export default App;