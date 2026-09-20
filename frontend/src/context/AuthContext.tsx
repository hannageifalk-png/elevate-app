import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { MockStateContext } from "./mockState";

type Profile = {
  id: string;
  email: string;
  display_name: string;
  role: number;
  created_at: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("app_user")
      .select("id, email, display_name, role, created_at")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch profile:", error.message);
      setProfile(null);
      return;
    }

    setProfile(data);
  };

  const refreshProfile = async () => {
  if (user) {
    await fetchProfile(user.id);
  }
};

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      setUser(data.user);

      if (data.user) {
        await fetchProfile(data.user.id);
      }

      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const mock = useContext(MockStateContext);
  const mockLevel = import.meta.env.DEV ? (mock?.state.level ?? null) : null;
  const shownProfile =
    profile && mockLevel !== null ? { ...profile, role: mockLevel } : profile;

  return (
    <AuthContext.Provider
      value={{ user, profile: shownProfile, loading, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}