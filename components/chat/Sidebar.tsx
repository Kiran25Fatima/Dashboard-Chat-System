"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-violet-600",
];

const getAvatarColor = (id: string) =>
  avatarColors[id?.charCodeAt(0) % avatarColors.length || 0];

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

export default function Sidebar({ onSelectUser }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [onlineMap, setOnlineMap] = useState<any>({});
  const [search, setSearch] = useState("");
  const [activeUserId, setActiveUserId] = useState<string | null>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadMap, setUnreadMap] = useState<any>({});
  

  const loadUsers = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    setCurrentUserId(userId ?? null);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .neq("id", userId);

   const { data: messages } = await supabase
  .from("messages")
  .select("sender_id")
  .eq("receiver_id", currentUserId)
  .eq("is_read", false);

const unread: any = {};

messages?.forEach((m) => {
  unread[m.sender_id] = (unread[m.sender_id] || 0) + 1;
});

    setUnreadMap(unread);
    setUsers(profiles || []);
  };

useEffect(() => {
  loadUsers();

  const channel = supabase.channel("online-users");

const messageChannel = supabase
  .channel("realtime-messages")

  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
    },
    async (payload) => {
      const msg: any = payload.new;

      if (!currentUserId) return;

      if (msg.receiver_id === currentUserId) {
        setUnreadMap((prev: any) => ({
          ...prev,
          [msg.sender_id]: (prev[msg.sender_id] || 0) + 1,
        }));

        await supabase.from("messages").update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
        }).eq("id", msg.id);
      }
    }
  )

  .on(
    "postgres_changes",
    {
      event: "UPDATE",
      schema: "public",
      table: "messages",
    },
    (payload) => {
      const msg: any = payload.new;

      if (!currentUserId) return;

      if (msg.is_read === true && msg.receiver_id === currentUserId) {
        setUnreadMap((prev: any) => ({
          ...prev,
          [msg.sender_id]: Math.max((prev[msg.sender_id] || 1) - 1, 0),
        }));
      }
    }
  )

  .subscribe();

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const onlineUsers: any = {};

      Object.keys(state).forEach((key) => {
        state[key].forEach((p: any) => {
          onlineUsers[p.user_id] = true;
        });
      });

      setOnlineMap(onlineUsers);
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const { data } = await supabase.auth.getUser();

        if (data.user) {
          await channel.track({
            user_id: data.user.id,
            online_at: new Date().toISOString(),
          });
        }
      }
    });

  return () => {
    supabase.removeChannel(channel);
    supabase.removeChannel(messageChannel);
  };
}, [currentUserId]);

const filteredUsers = users.filter((u) =>
  u.full_name?.toLowerCase().includes(search.toLowerCase())
);

 return (
    <div
      className="h-full flex flex-col"
      style={{
        background: "linear-gradient(180deg, #fdfcff 0%, #f8f5ff 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      
      <div
        className="px-4 pt-5 pb-4 sticky top-0 z-10"
        style={{
          background: "linear-gradient(180deg, rgba(253,252,255,0.99) 80%, transparent 100%)",
        }}
      >
     
        <p
          className="text-[10px] font-bold tracking-[0.18em] uppercase mb-3"
          style={{ color: "#b8acd6" }}
        >
          Find People
        </p>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <svg
              className="w-3.5 h-3.5 transition-colors duration-150"
              style={{ color: "#b8acd6" }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full h-11 pl-10 pr-10 text-sm outline-none transition-all duration-200 placeholder:font-normal"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(139,92,246,0.12)",
              borderRadius: "14px",
              color: "#2e1065",
              fontFamily: "inherit",
              boxShadow: "0 2px 8px rgba(109,40,217,0.05)",
            }}
            onFocus={e => {
              (e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.40)";
              (e.target as HTMLInputElement).style.boxShadow = "0 0 0 4px rgba(139,92,246,0.08), 0 2px 8px rgba(109,40,217,0.06)";
              (e.target as HTMLInputElement).style.background = "#ffffff";
            }}
            onBlur={e => {
              (e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.12)";
              (e.target as HTMLInputElement).style.boxShadow = "0 2px 8px rgba(109,40,217,0.05)";
              (e.target as HTMLInputElement).style.background = "rgba(255,255,255,0.85)";
            }}
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150"
              style={{ background: "rgba(139,92,246,0.10)", color: "#7c3aed" }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="px-5 pb-2 flex items-center justify-between">
        <span
          className="text-[10px] font-bold tracking-[0.18em] uppercase"
          style={{ color: "#b8acd6" }}
        >
          Chats
        </span>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: "linear-gradient(90deg, rgba(139,92,246,0.10), rgba(167,139,250,0.14))",
            color: "#7c3aed",
            border: "1px solid rgba(139,92,246,0.15)",
          }}
        >
          {filteredUsers.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {filteredUsers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(167,139,250,0.12) 100%)",
                border: "1px solid rgba(139,92,246,0.12)",
              }}
            >
              <svg
                className="w-7 h-7"
                style={{ color: "#c4b5fd" }}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-bold" style={{ color: "#2e1065" }}>No users found</h3>
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#b8acd6" }}>
              Try searching with a different name
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredUsers.map((user) => {
              const isOnline = onlineMap[user.id];
              const isActive = activeUserId === user.id;
              const unreadCount = unreadMap[user.id] || 0;

              return (
                <button
                  key={user.id}
                  onClick={() => {
                    setActiveUserId(user.id);
                    setUnreadMap((prev: any) => ({ ...prev, [user.id]: 0 }));
                    onSelectUser(user);
                  }}
                  className="w-full cursor-pointer group relative flex items-center gap-3 px-3 py-3 transition-all duration-200"
                  style={{
                    borderRadius: "16px",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(167,139,250,0.10) 100%)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(139,92,246,0.18)"
                      : "1px solid transparent",
                    boxShadow: isActive ? "0 4px 16px rgba(109,40,217,0.08)" : "none",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.04)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.08)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                    }
                  }}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white`}
                      style={{
                        background: `linear-gradient(135deg, #7c3aed, #a78bfa)`,
                        boxShadow: isActive
                          ? "0 4px 12px rgba(124,58,237,0.30)"
                          : "0 2px 8px rgba(124,58,237,0.15)",
                      }}
                    >
                      {getInitials(user.full_name)}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                      style={{ background: isOnline ? "#34d399" : "#d1d5db" }}
                    />
                  </div>

  
                  <div className="flex-1 min-w-0 text-left">
                    <h3
                      className="text-sm truncate"
                      style={{
                        color: isActive ? "#5b21b6" : "#1e0a3c",
                        fontWeight: isActive ? 700 : 600,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {user.full_name}
                    </h3>
                    <p
                      className="text-xs mt-0.5 font-medium"
                      style={{ color: isOnline ? "#10b981" : "#b8acd6" }}
                    >
                      {isOnline ? "● Active now" : "○ Offline"}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <div
                      className="min-w-5 h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full"
                      style={{
                        background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                        boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
                      }}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  )}
                  {isActive && (
                    <div
                      className="w-1.5 h-6 rounded-full shrink-0"
                      style={{ background: "linear-gradient(180deg, #7c3aed, #a78bfa)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}