"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="h-screen flex bg-gray-100">

      <div className="w-80 bg-white shadow-sm relative">

        <Sidebar onSelectUser={setSelectedUser} />

        <button
          onClick={handleLogout}
          className="absolute bottom-4 left-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          Logout
        </button>

      </div>

      <div className="flex-1 flex flex-col bg-white shadow-inner">
        <ChatWindow selectedUser={selectedUser} />
      </div>

    </div>
  );
}