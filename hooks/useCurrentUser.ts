import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function useCurrentUser() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    setUser(data.user ?? null);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  return { user, loading, refresh } as const;
}
