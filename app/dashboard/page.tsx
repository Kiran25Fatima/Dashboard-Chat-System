"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-[#f5f3ff] text-zinc-900 font-sans overflow-hidden p-3 md:p-4">
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-white/80 backdrop-blur-xl overflow-hidden"
        style={{ boxShadow: "0 8px 40px rgba(109,40,217,0.08), 0 1.5px 8px rgba(109,40,217,0.04)" }}>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Header */}
        <header className="shrink-0 h-12 px-4 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.95)",
            borderBottom: "1px solid rgba(139,92,246,0.07)",
            boxShadow: "0 1px 12px rgba(139,92,246,0.04)"
          }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
              style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>

            <span className="text-sm font-semibold tracking-tight text-zinc-800">Chat</span>

            <span className="hidden md:block text-xs text-zinc-400 border-l border-zinc-100 pl-2.5 ml-0.5">
              Messages & contacts
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg transition"
              style={{ background: "rgba(139,92,246,0.06)" }}
            >
              <svg className="w-4 h-4 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button
              onClick={logout}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition"
              style={{
                border: "1px solid rgba(239,68,68,0.15)",
                background: "rgba(255,241,241,0.7)",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(254,226,226,0.9)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,241,241,0.7)")}
            >
              <svg className="w-3.5 h-3.5 text-red-400 group-hover:text-red-500 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-3-3-3m3 3H9" />
              </svg>
              <span className="text-xs font-medium text-red-400 group-hover:text-red-500 transition">
                Sign out
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* Sidebar */}
          <aside
            className={`
              fixed md:static z-30 inset-y-0 left-0
              md:h-full md:w-72 md:shrink-0
              w-72 h-full
              flex flex-col overflow-hidden
              transform transition-transform duration-200
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
            style={{
              background: "rgba(250,248,255,0.98)",
              borderRight: "1px solid rgba(139,92,246,0.06)",
              boxShadow: "1px 0 16px rgba(109,40,217,0.04)"
            }}
          >
            <Sidebar
              onSelectUser={(user: any) => {
                setSelectedUser(user);
                setSidebarOpen(false);
              }}
            />
          </aside>

          {/* Chat window */}
          <div
            className="flex-1 min-w-0 flex flex-col"
            style={{ background: "#ffffff" }}
          >
            <ChatWindow selectedUser={selectedUser} />
          </div>
        </div>
      </div>
    </div>
  );
}