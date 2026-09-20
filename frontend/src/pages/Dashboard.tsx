import { useNavigate } from "react-router-dom"; 
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import MembershipGate from "../components/MembershipGate";
import { MEMBERSHIP, MEMBERSHIP_NAMES } from "../constants/membership";

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
      <p>
        Medlemsnivå:{" "}
        {profile ? MEMBERSHIP_NAMES[profile.role] : "Laddar..."}
        </p>

        <MembershipGate requiredRole={MEMBERSHIP.PREMIUM}>
        <div>
            <h2>Premium</h2>
            <p>Du har tillgång till Premium!</p>
        </div>
        </MembershipGate>
      
      <button onClick={handleLogout}>
        Logga ut
      </button>
    </main>
  );
}

export default Dashboard;