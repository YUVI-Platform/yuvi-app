import { useEffect, useState } from "react";
import { superbase } from "@/utils/supabase/superbaseClient";
import { User } from "@supabase/supabase-js";

export const useUserRole = () => {
  const [role, setRole] = useState<
    null | "athlete" | "motionExpert" | "studioHost"
  >(null);

  useEffect(() => {
    const getUserRole = async () => {
      const {
        data: { user },
        error,
      } = await superbase.auth.getUser();

      if (error) {
        console.error("Fehler beim Abrufen des Users:", error);
        return;
      }

      const role = user?.user_metadata?.role;
      setRole(role);
    };

    getUserRole();
  }, []);

  return role;
};

export const useSupabaseUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
        error,
      } = await superbase.auth.getUser();

      if (error) {
        console.error("Fehler beim Abrufen des Users:", error.message);
        setUser(null);
      } else {
        setUser(user);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  return { user, loading };
};
