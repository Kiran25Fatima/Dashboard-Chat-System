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
    <div className="h-screen flex bg-zinc-50 text-zinc-900 font-sans overflow-hidden">

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static z-30 h-full w-80 bg-white border-r border-zinc-200
          transform transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-zinc-200 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>

            <div>
              <div className="text-sm font-semibold">Chat</div>
              <div className="text-xs text-zinc-500">Messages & contacts</div>
            </div>
          </div>

         <button
  onClick={logout}
  className="group flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-red-50 hover:border-red-200 transition"
>
  <svg
    className="w-4 h-4 text-zinc-500 group-hover:text-red-600 transition"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-3-3-3m3 3H9" />
  </svg>

  <span className="text-xs font-medium text-zinc-600 group-hover:text-red-600 transition">
    Sign out
  </span>
</button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-zinc-50">
          <div className="p-3 h-full">
            <div className="h-full bg-white border border-zinc-200 rounded-xl overflow-hidden">
              <Sidebar
                onSelectUser={(user: any) => {
                  setSelectedUser(user);
                  setSidebarOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 bg-zinc-50">

        <div className="md:hidden h-14 flex items-center justify-between px-4 border-b bg-white">

          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-zinc-100 transition"
          >
            <svg
              className="w-5 h-5 text-zinc-700"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="text-sm font-semibold text-zinc-800">
            Messages
          </div>

          <div className="w-10 h-10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
          </div>

        </div>

        <div className="flex-1 m-2 md:m-4 bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

          {!selectedUser ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div className="max-w-md">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-violet-100 flex items-center justify-center">
                  💬
                </div>

                <h2 className="text-lg font-semibold text-zinc-800">
                  No conversation selected
                </h2>

                <p className="text-sm text-zinc-500 mt-2">
                  Select a user to start chatting
                </p>
              </div>
            </div>
          ) : (
            <ChatWindow selectedUser={selectedUser} />
          )}

        </div>
      </main>
    </div>
  );
}