"use client";

import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.auth.getSession();
      console.log("Supabase test:", data, error);
    };

    testConnection();
  }, []);

  return (
    <div>
      <h1>Chat System Running</h1>
    </div>
  );
}