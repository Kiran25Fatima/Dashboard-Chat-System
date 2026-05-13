"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
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

export default function ChatWindow({ selectedUser }: any) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selectedUser || !user) return;

      setLoading(true);
      setConversationId(null);

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${selectedUser.id}),and(user1_id.eq.${selectedUser.id},user2_id.eq.${user.id})`
        )
        .maybeSingle();

      if (existing) {
        setConversationId(existing.id);
        setLoading(false);
        return;
      }

      const { data: created } = await supabase
        .from("conversations")
        .insert({
          user1_id: user.id,
          user2_id: selectedUser.id,
        })
        .select("id")
        .single();

      setConversationId(created?.id || null);
      setLoading(false);
    };

    run();
  }, [selectedUser, user]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center  bg-linear-to-br from-white to-zinc-50 px-6">
        <div className="max-w-sm text-center">
          <div className="relative mx-auto mb-6 w-24 h-24">
            <div className="absolute inset-0 rounded-3xl bg-violet-100 blur-2xl opacity-60" />

            <div className="relative w-24 h-24 rounded-3xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center">
              <svg
                className="w-10 h-10 text-violet-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-zinc-900">
            Your messages
          </h2>

          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
            Select a conversation from the sidebar and start chatting instantly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-50">

      <div className="shrink-0 px-4 md:px-5 py-3 border-b border-zinc-200 bg-white flex items-center justify-between">

        <div className="flex items-center gap-3 min-w-0">

          <div className="relative shrink-0">
            <div
              className={`w-11 h-11 rounded-2xl  bg-linear-to-br ${getAvatarColor(
                selectedUser.id
              )} flex items-center justify-center text-sm font-semibold text-white shadow-sm`}
            >
              {getInitials(selectedUser.full_name)}
            </div>

            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm md:text-[15px] font-semibold text-zinc-900 truncate">
              {selectedUser.full_name}
            </h2>

            {/* <p className="text-xs text-emerald-500 mt-0.5">
              Online
            </p> */}
          </div>
        </div>

        <div className="flex items-center gap-1">

          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-violet-600 transition">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 6.338c0 .232.046.463.137.683l3.243 7.777c.275.659.933 1.088 1.645 1.088.35 0 .695-.09.999-.264l2.21-1.258c.206-.118.461-.118.667 0l2.21 1.258c.304.174.648.264.999.264.712 0 1.37-.43 1.645-1.088l3.243-7.777a1.88 1.88 0 0 0 .137-.683V6.25a2 2 0 0 0-2-2h-15a2 2 0 0 0-2 2v.088Z"
              />
            </svg>
          </button>

          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-zinc-100 hover:text-violet-600 transition">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9A2.25 2.25 0 0 0 4.5 18.75Z"
              />
            </svg>
          </button>

        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.06),transparent_35%)]">
        {conversationId ? (
          <MessageList conversationId={conversationId} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-zinc-300 border-t-violet-500 animate-spin" />

              <p className="text-sm text-zinc-500">
                {loading ? "Preparing conversation..." : "Ready"}
              </p>
            </div>
          </div>
        )}
      </div>

      {user && (
        <div className="shrink-0 bg-white border-t border-zinc-200 px-2 md:px-3 py-2">
          <MessageInput
            conversationId={conversationId}
            senderId={user.id}
            onMessageSent={() => {}}
          />
        </div>
      )}
    </div>
  );
}