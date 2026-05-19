"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import NewChatModal from "@/components/chat/NewChatModal";

export default function DashboardPage() {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newConversation, setNewConversation] = useState<any>(null);

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f8f5ff 0%, #ede9fe 40%, #f3f0ff 70%, #faf8ff 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >

      <div
        className="pointer-events-none fixed -top-30 -left-20 w-105 h-105 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        className="pointer-events-none fixed -bottom-25 -right-15 w-85 h-85 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", filter: "blur(70px)" }}
      />

      <div
        className="relative flex-1 flex flex-col m-3 md:m-4 rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.82)",
          backdropFilter: "blur(24px)",
          boxShadow: "0 0 0 1px rgba(139,92,246,0.10), 0 24px 64px rgba(109,40,217,0.12), 0 4px 16px rgba(109,40,217,0.06)",
        }}
      >
        {sidebarOpen && (
  <div
    className="fixed inset-0 z-40 md:hidden"
    style={{ background: "rgba(60,20,120,0.15)", backdropFilter: "blur(2px)" }}
    onClick={() => setSidebarOpen(false)}
  />
)}

        <header
          className="shrink-0 h-14 px-5 flex items-center justify-between"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(248,245,255,0.97) 100%)",
            borderBottom: "1px solid rgba(139,92,246,0.09)",
            boxShadow: "0 1px 0 rgba(139,92,246,0.06), 0 2px 16px rgba(109,40,217,0.04)",
          }}
        >
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(140deg, #7c3aed 0%, #a78bfa 100%)",
                boxShadow: "0 4px 12px rgba(124,58,237,0.35)",
              }}
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 0-1.032-.211 50.89 50.89 0 0 0-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 0 0 2.433 3.984L7.28 21.53A.75.75 0 0 1 6 21v-4.03a48.527 48.527 0 0 1-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979Z" />
                <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 0 0 1.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0 0 15.75 7.5Z" />
              </svg>
            </div>

            <div className="flex items-center gap-2.5">
              <span
                className="text-[15px] font-bold tracking-tight"
                style={{ color: "#3b0764", letterSpacing: "-0.02em" }}
              >
                Conversa
              </span>
              {/* <span
                className="hidden md:block text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "linear-gradient(90deg, rgba(139,92,246,0.10), rgba(167,139,250,0.12))",
                  color: "#7c3aed",
                  border: "1px solid rgba(139,92,246,0.15)",
                }}
              >
                Messages
              </span> */}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
  onClick={() => setSidebarOpen(true)}
  className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 relative group"
  style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.12)" }}
>
  <svg className="w-4 h-4" style={{ color: "#7c3aed" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
  </svg>

  <div
    className="absolute top-11 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-50"
  >

    <div
      className="mx-auto -mb-px"
      style={{
        width: "8px",
        height: "8px",
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(139,92,246,0.12)",
        borderBottom: "none",
        borderRight: "none",
        transform: "rotate(45deg)",
        marginLeft: "calc(50% - 4px)",
      }}
    />
    <div
      className="rounded-2xl px-4 py-3 flex flex-col items-center gap-1 min-w-32.5"
      style={{
        background: "rgba(255,255,255,0.97)",
        border: "1px solid rgba(139,92,246,0.12)",
        boxShadow: "0 8px 32px rgba(109,40,217,0.12), 0 2px 8px rgba(109,40,217,0.06)",
      }}
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center mb-0.5"
        style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
      >
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      <span
        className="text-xs font-bold"
        style={{ color: "#2e1065" }}
      >
        Conversations
      </span>
      <span
        className="text-[10px] font-medium"
        style={{ color: "#b8acd6" }}
      >
        Open sidebar
      </span>
    </div>
  </div>
</button>

        <button
  onClick={logout}
  className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200
             hover:-translate-y-px
             hover:shadow-lg hover:shadow-violet-200
             hover:border-violet-300"
  style={{
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(167,139,250,0.08))",
    border: "1px solid rgba(139,92,246,0.15)",
  }}
>
  <svg
    className="w-4 h-4 text-[#7c3aed] group-hover:text-[#6d28d9] transition-colors"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-3-3-3m3 3H9"
    />
  </svg>

  <span className="text-xs font-bold text-[#6d28d9] group-hover:text-[#5b21b6] transition-colors">
    Logout
  </span>
</button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex-1 flex min-h-0 gap-px bg-[#ede9fe]">

      <aside
  className={`
    fixed md:static z-50 inset-y-0 left-0
   md:h-full md:w-95 md:shrink-0
w-95 h-full flex flex-col overflow-hidden
    transform transition-transform duration-200
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
  style={{
    background: "rgba(252,250,255,0.98)",
    borderRight: "1px solid rgba(139,92,246,0.08)",
    boxShadow: "4px 0 30px rgba(109,40,217,0.08)",
  }}
>
            <Sidebar
              selectedConversationId={selectedConversation?.id}
              onOpenNewChat={() => setIsNewChatOpen(true)}
              newConversation={newConversation}
              onSelectConversation={(conversation: any) => {
                setSelectedConversation(conversation);
                setSidebarOpen(false);
              }}
              onUpdateSelectedConversation={(conversation: any) => {
                setSelectedConversation(conversation);
              }}
            />
          </aside>
          <div className="flex-1 min-w-0 flex flex-col bg-white relative" style={{
  boxShadow: "-6px 0 30px rgba(109,40,217,0.04)"
}}>
            <ChatWindow selectedConversation={selectedConversation} />
          </div>
        </div>
      </div>
      {isNewChatOpen && (
        <NewChatModal
          onClose={() => setIsNewChatOpen(false)}
          onConversationCreated={(conversation:any) => {
            setSelectedConversation(conversation);
            setSidebarOpen(false);
            setNewConversation(conversation);
            setIsNewChatOpen(false);
          }}
        />
      )}
    </div>
  );
}