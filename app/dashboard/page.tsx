"use client";

import { useState, useRef,useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/chat/Sidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import NewChatModal from "@/components/features/NewChatModal";
import CreateGroupModal from "@/components/features/CreateGroupModal";
import useConversations from "@/hooks/useConversations";
import useCurrentUser from "@/hooks/useCurrentUser";


export default function DashboardPage() {
  const router = useRouter();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newConversation, setNewConversation] = useState<any>(null);
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const leaveGroupRef = useRef<((id: string) => void) | null>(null);

  const { user } = useCurrentUser();
const [notifications, setNotifications] = useState<any[]>([]);
const [showNotifications, setShowNotifications] = useState(false);
const bellRef = useRef<HTMLDivElement>(null);




const onSelectConversation = (conversation: any) => {
  setSelectedConversation(conversation);
  setSidebarOpen(false);
};

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  useEffect(() => {
  if (!user?.id) return;

  // Fetch existing notifications
  supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .then(({ data }) => {
      if (data) setNotifications(data);
    });

  const channel = supabase
    .channel(`notifications-${user.id}`)
    .on("postgres_changes", {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `user_id=eq.${user.id}`,
    }, (payload) => {
      setNotifications((prev) => [payload.new, ...prev]);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [user]);

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        // background: "linear-gradient(135deg, #f8f5ff 0%, #ede9fe 40%, #f3f0ff 70%, #faf8ff 100%)",
        background: "#f7f7fb",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >

      {/* <div
        className="pointer-events-none fixed -top-30 -left-20 w-105 h-105 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)", filter: "blur(60px)" }}
      />
      <div
        className="pointer-events-none fixed -bottom-25 -right-15 w-85 h-85 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", filter: "blur(70px)" }}
      /> */}

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
            // background: "linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(248,245,255,0.97) 100%)",
            // borderBottom: "1px solid rgba(139,92,246,0.09)",
            // boxShadow: "0 1px 0 rgba(139,92,246,0.06), 0 2px 16px rgba(109,40,217,0.04)",
            background: "rgba(255,255,255,0.9)",
backdropFilter: "blur(12px)",
borderBottom: "1px solid rgba(0,0,0,0.06)",
boxShadow: "none",
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

{/* Bell Icon */}
<div className="relative" ref={bellRef}>
  <button
    onClick={() =>{console.log("bell clicked", showNotifications); setShowNotifications(!showNotifications)}}
    className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150"
    style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.12)" }}
  >
    <svg className="w-4 h-4" style={{ color: "#7c3aed" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    {notifications.length > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
        {notifications.length}
      </span>
    )}
  </button>

  
</div>

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

        {/* Dropdown */}
  {showNotifications && (
    <div
      className="absolute right-5 top-16 w-80 rounded-2xl overflow-hidden z-50"
      style={{
        background: "white",
        border: "1px solid rgba(139,92,246,0.12)",
        boxShadow: "0 8px 32px rgba(109,40,217,0.12)",
      }}
    >
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <span className="text-sm font-bold text-slate-800">Notifications</span>
        {notifications.length > 0 && (
          <button
            onClick={async () => {
              await supabase
                .from("notifications")
                .update({ is_read: true })
                .eq("user_id", user?.id)
                .eq("is_read", false);
              setNotifications([]);
            }}
            className="text-xs text-indigo-600 font-semibold hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No new notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50">
              <p className="text-xs font-medium text-slate-700">{n.message}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {new Date(n.created_at).toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )}

        {/* ── Body ── */}
        <div className="flex-1 flex min-h-0" style={{ background: "rgba(139,92,246,0.12))" }}>

      <aside
  className={`
    fixed md:static z-50 inset-y-0 left-0
   md:h-full md:w-95 md:shrink-0
w-95 h-full flex flex-col overflow-hidden
    transform transition-transform duration-200
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
  `}
  style={{
    // background: "rgba(252,250,255,0.98)",
    // borderRight: "1px solid rgba(139,92,246,0.08)",
    // boxShadow: "4px 0 30px rgba(109,40,217,0.08)",
     background: "transparent", 
          borderRight: "none",      
boxShadow: "none",
  }}
>
            <Sidebar
              selectedConversationId={selectedConversation?.id}
              onOpenNewChat={() => setIsNewChatOpen(true)}
              onOpenNewGroup={() => setIsGroupOpen(true)}
              newConversation={newConversation}
              onSelectConversation={onSelectConversation}
              onUpdateSelectedConversation={(conversation: any) => {
                setSelectedConversation(conversation);
              }}
               onLeaveGroupReady={(fn: any) => { leaveGroupRef.current = fn; }}
            />
          </aside>
          <div className="flex-1 min-w-0 flex flex-col bg-white relative" style={{
  boxShadow: "-6px 0 30px rgba(109,40,217,0.04)"
}}>
            <ChatWindow
  selectedConversation={selectedConversation}
  onLeaveGroup={(groupId: string) => {
    leaveGroupRef.current?.(groupId);
    onSelectConversation(null); // Clears the active chat in UI
  }}
  onGroupUpdated={(updatedGroup: any) => {
    setSelectedConversation(updatedGroup); // update header instantly
  }}
/>
          </div>
        </div>
      </div>
      {isNewChatOpen && (
        <NewChatModal
          onClose={() => setIsNewChatOpen(false)}
          onConversationCreated={(conversation:any) => {
            onSelectConversation(conversation);
            setNewConversation(conversation);
            setIsNewChatOpen(false);
          }}
        />
      )}

      {isGroupOpen && (
  <CreateGroupModal
    onClose={() => setIsGroupOpen(false)}
    onGroupCreated={(group: any) => {
      onSelectConversation(group);
      setNewConversation(group);
      setIsGroupOpen(false);
    }}
  />
)}
    </div>
  );
}