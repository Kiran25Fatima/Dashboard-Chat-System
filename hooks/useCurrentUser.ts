import { useSupabase } from "@/components/providers/AuthProvider";
 
export default function useCurrentUser() {
  const { supabase, user } = useSupabase();
 
  const refresh = async () => {
    // user is already kept in sync by AuthProvider
    // nothing needed here
  };
 
  return { user, loading: !user, refresh } as const;
}