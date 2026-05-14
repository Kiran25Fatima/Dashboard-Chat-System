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
    <div className="h-screen flex flex-col bg-linear-to-br from-violet-100 via-purple-50 to-zinc-100 text-zinc-900 font-sans overflow-hidden p-3 md:p-4">
      <div className="flex-1 flex flex-col min-h-0 rounded-2xl bg-white border border-zinc-200/50 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <header className="shrink-0 h-12 bg-white/95 backdrop-blur-xl px-4 flex items-center justify-between border-b border-zinc-200/40 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shadow-sm ring-1 ring-white/20">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>

            <span className="text-sm font-semibold">Chat</span>

            <span className="hidden md:block text-xs text-zinc-400 border-l border-zinc-200/40 pl-2.5 ml-0.5">
              Messages & contacts
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100/70 transition"
            >
              <svg className="w-4 h-4 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button
              onClick={logout}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200/50 bg-white hover:bg-red-50/60 hover:border-red-200 transition shadow-sm"
            >
              <svg className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-500 transition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-3-3-3m3 3H9" />
              </svg>
              <span className="text-xs font-medium text-zinc-500 group-hover:text-red-500 transition">
                Sign out
              </span>
            </button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          <aside
            className={`
              fixed md:static z-30 inset-y-0 left-0
              md:h-full md:w-72 md:shrink-0
              w-72 h-full
              bg-white
              border-r border-zinc-200/30
              shadow-[1px_0_0_0_rgba(0,0,0,0.04)]
              flex flex-col overflow-hidden
              transform transition-transform duration-200
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}
          >
            <Sidebar
              onSelectUser={(user: any) => {
                setSelectedUser(user);
                setSidebarOpen(false);
              }}
            />
          </aside>

          <div className="flex-1 min-w-0 bg-white flex flex-col">
            <ChatWindow selectedUser={selectedUser} />
          </div>
        </div>
      </div>
    </div>
  );
}