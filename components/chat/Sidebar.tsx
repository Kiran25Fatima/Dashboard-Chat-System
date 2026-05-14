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
  .select("sender_id, receiver_id, is_read")
  .eq("receiver_id", userId)
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
      event: "*",
      schema: "public",
      table: "messages",
    },
    (payload) => {
      const msg: any = payload.new;

      if (!currentUserId) return;

      // NEW MESSAGE
      if (
        payload.eventType === "INSERT" &&
        msg.receiver_id === currentUserId
      ) {
        setUnreadMap((prev: any) => ({
          ...prev,
          [msg.sender_id]: (prev[msg.sender_id] || 0) + 1,
        }));
      }

      // READ UPDATE
      if (
        payload.eventType === "UPDATE" &&
        msg.is_read === true
      ) {
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
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 pb-3 bg-white sticky top-0 z-10">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg
              className="w-4 h-4 text-zinc-400 group-focus-within:text-violet-500 transition"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats"
            className="w-full h-12 pl-11 pr-11 text-sm bg-zinc-100/70 hover:bg-zinc-100 focus:bg-white border border-transparent focus:border-violet-300 rounded-2xl outline-none transition-all duration-200 placeholder:text-zinc-400 shadow-sm focus:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          Messages
        </span>
        <div className="text-xs text-zinc-400">{filteredUsers.length}</div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {filteredUsers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-zinc-400"
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

            <h3 className="text-sm font-semibold text-zinc-800">
              No users found
            </h3>

            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
              Try searching with another name
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

  setUnreadMap((prev: any) => ({
    ...prev,
    [user.id]: 0,
  }));

  onSelectUser(user);
}}
                 className={`w-full cursor-pointer group relative flex items-center gap-3 px-3 py-3 rounded-2xl border transition-all duration-200 hover:bg-zinc-50 hover:scale-[1.01] ${
                    isActive
                      ? "bg-violet-50 border-violet-200 shadow-sm"
                      : "bg-white border-transparent hover:bg-zinc-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-linear-to-br ${getAvatarColor(
                        user.id
                      )} flex items-center justify-center text-sm font-semibold text-white shadow-sm`}
                    >
                      {getInitials(user.full_name)}
                    </div>

                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? "bg-emerald-400" : "bg-zinc-300"
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <h3
                      className={`text-sm truncate ${
                        isActive
                          ? "text-violet-700 font-semibold"
                          : "text-zinc-900 font-medium"
                      }`}
                    >
                      {user.full_name}
                    </h3>

                    <p
                      className={`text-xs mt-0.5 ${
                        isOnline ? "text-emerald-500" : "text-zinc-500"
                      }`}
                    >
                      {isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <div className="min-w-4.5 h-5 px-1 flex items-center justify-center text-[11px] font-semibold text-white bg-violet-500 rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </div>
                  )}

                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
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