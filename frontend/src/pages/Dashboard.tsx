import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Log out failed:", error.message);
    return;
  }

  navigate("/login");
};

  return (
    <main>
      <h1>Dashboard</h1>

      <p>Inloggad som: {user?.email}</p>
      <p>Name: {profile?.display_name}</p>
      <p>Role: {profile?.role}</p>
      
      <button onClick={handleLogout}>
        Logga ut
      </button>
    </main>
  );
}

export default Dashboard;