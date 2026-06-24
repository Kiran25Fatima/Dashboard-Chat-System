"use client";
 
import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { SupabaseClient, User } from "@supabase/supabase-js";
 
const SupabaseContext = createContext<{
  supabase: SupabaseClient;
  user: User | null;
} | null>(null);
 
export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error("useSupabase must be used inside AuthProvider");
  return ctx;
}
 
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
 
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Ignore token refreshes — same user, no need to update state
        if (event === "TOKEN_REFRESHED") return;

        setUser((prev) => {
          const nextUser = session?.user ?? null;
          // Avoid creating a new reference if it's the same user
          if (prev?.id === nextUser?.id) return prev;
          return nextUser;
        });
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);
 
  return (
<SupabaseContext.Provider value={{ supabase, user }}>
      {children}
</SupabaseContext.Provider>
  );
}