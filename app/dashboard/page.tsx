"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div>
      <h1>Dashboard (Protected)</h1>

      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}