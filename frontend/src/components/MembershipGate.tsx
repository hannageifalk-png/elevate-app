import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { MEMBERSHIP_NAMES } from "../constants/membership";

type MembershipGateProps = {
  requiredRole: number;
  children: ReactNode;
};

function MembershipGate({
  requiredRole,
  children,
}: MembershipGateProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return <p>Laddar...</p>;
  }

  if (!profile) {
    return <p>Användaren kunde inte hittas.</p>;
  }

  if (profile.role < requiredRole) {
    return (
      <div>
        <h2>Uppgradering krävs</h2>
        <p>
          Innehållet kräver medlemskapet{" "}
          {MEMBERSHIP_NAMES[requiredRole]}
        </p>
      </div>
    );
  }

  return children;
}

export default MembershipGate;