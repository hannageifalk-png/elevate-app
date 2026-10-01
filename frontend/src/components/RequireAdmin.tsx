import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { MEMBERSHIP } from "../constants/membership";

function RequireAdmin({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <p>Laddar...</p>;
  }

  if (!profile || profile.role !== MEMBERSHIP.ADMIN) {
    return (
      <main>
        <h1>Åtkomst nekad</h1>
        <p>Den här sidan är bara tillgänglig för administratörer.</p>
      </main>
    );
  }

  return <>{children}</>;
}

export default RequireAdmin;
