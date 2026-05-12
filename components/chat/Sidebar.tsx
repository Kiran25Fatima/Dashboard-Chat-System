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

  const loadUsers = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData.user?.id;

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name")
      .neq("id", currentUserId);

    if (data) setUsers(data);
  };

  useEffect(() => {
    loadUsers();

    const channel = supabase.channel("online-users");

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
    };
  }, []);

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-zinc-900">
      <div className="px-3 pb-3 pt-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 border border-zinc-200 dark:border-zinc-700 outline-none focus:border-violet-500 transition"
          />
        </div>
      </div>

      <div className="px-4 mb-2">
        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
          Direct Messages
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 space-y-1">
        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
              <svg
                className="w-5 h-5 text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No users found
            </p>
          </div>
        )}

        {filteredUsers.map((user) => {
          const isOnline = onlineMap[user.id];
          const isActive = activeUserId === user.id;

          return (
            <button
              key={user.id}
              onClick={() => {
                setActiveUserId(user.id);
                onSelectUser(user);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition ${
                isActive
                  ? "bg-violet-100 dark:bg-violet-600/20 border border-violet-300 dark:border-violet-500/30"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-transparent"
              }`}
            >
              <div className="relative shrink-0">
                <div
                  className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(
                    user.id
                  )} flex items-center justify-center text-xs font-bold text-white shadow`}
                >
                  {getInitials(user.full_name)}
                </div>

                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                    isOnline ? "bg-emerald-400" : "bg-zinc-500"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className={`text-sm font-medium truncate ${
                    isActive
                      ? "text-violet-700 dark:text-violet-200"
                      : "text-zinc-900 dark:text-zinc-100"
                  }`}
                >
                  {user.full_name}
                </div>

                <div
                  className={`text-xs ${
                    isOnline
                      ? "text-emerald-500"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {isOnline ? "Active now" : "Offline"}
                </div>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}