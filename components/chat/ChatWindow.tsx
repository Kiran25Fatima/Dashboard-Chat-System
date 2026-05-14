"use client";

import { useEffect, useRef, useState } from "react";
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

// ✅ Helper: deduplicate presence entries by user_id (last entry wins)
const getLatestPerUser = (all: any[]) =>
  Object.values(
    all.reduce((acc: any, p: any) => {
      acc[p.user_id] = p;
      return acc;
    }, {})
  ) as any[];

export default function ChatWindow({ selectedUser }: any) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ✅ Single typing channel instance lives here (lifted up from MessageInput)
  const typingChannelRef = useRef<any>(null);
  const channelReadyRef = useRef(false);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    getUser();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selectedUser?.id || !user?.id) return;

      setLoading(true);
      setConversationId(null);

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${selectedUser.id}),and(user1_id.eq.${selectedUser.id},user2_id.eq.${user.id})`
        )
        .maybeSingle();

      let id = existing?.id;

      if (!existing) {
        const { data: created } = await supabase
          .from("conversations")
          .insert({
            user1_id: user.id,
            user2_id: selectedUser.id,
          })
          .select("id")
          .single();

        id = created?.id || null;
      }

      if (id) {
        setConversationId(id);

        if (!user?.id || !selectedUser?.id) return;

        await supabase
          .from("messages")
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
          })
          .eq("conversation_id", id)
          .eq("receiver_id", user.id)
          .eq("is_read", false);

        await supabase
          .from("messages")
          .update({
            status: "seen",
            read_at: new Date().toISOString(),
          })
          .eq("conversation_id", id)
          .eq("receiver_id", user.id);
      }

      setLoading(false);
    };

    run();
  }, [selectedUser, user]);

  // ✅ Only ONE channel is created here — shared with MessageInput via broadcastTyping prop
  useEffect(() => {
    if (!conversationId || !selectedUser || !user) return;

    let channel: any = null;

    const init = async () => {
      // Hard cleanup first
      if (typingChannelRef.current) {
        await supabase.removeChannel(typingChannelRef.current);
        typingChannelRef.current = null;
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      channelReadyRef.current = false;

      channel = supabase.channel(`typing:${conversationId}`);
      typingChannelRef.current = channel;

      // ✅ sync: deduplicate before checking typing
      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const all = Object.values(state).flat() as any[];
        const latest = getLatestPerUser(all);
        setIsTyping(
          latest.some((p) => p.user_id !== user.id && p.typing === true)
        );
      });

      // ✅ join: deduplicate before checking typing
      channel.on("presence", { event: "join" }, () => {
        const state = channel.presenceState();
        const all = Object.values(state).flat() as any[];
        const latest = getLatestPerUser(all);
        setIsTyping(
          latest.some((p) => p.user_id !== user.id && p.typing === true)
        );
      });

      // ✅ leave: deduplicate before checking typing
      channel.on("presence", { event: "leave" }, () => {
        const state = channel.presenceState();
        const all = Object.values(state).flat() as any[];
        const latest = getLatestPerUser(all);
        setIsTyping(
          latest.some((p) => p.user_id !== user.id && p.typing === true)
        );
      });

      channel.subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          channelReadyRef.current = true;
        }
      });

      // ✅ interval: deduplicate before checking typing
      typingIntervalRef.current = setInterval(() => {
        const state = channel.presenceState();
        const all = Object.values(state).flat() as any[];
        const latest = getLatestPerUser(all);
        setIsTyping(
          latest.some((p) => p.user_id !== user.id && p.typing === true)
        );
      }, 500);
    };

    init();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
      typingChannelRef.current = null;
      channelReadyRef.current = false;
    };
  }, [conversationId, selectedUser, user]);

  // ✅ This function is passed down to MessageInput so it uses the same channel
  const broadcastTyping = (typing: boolean) => {
    if (!typingChannelRef.current || !user) return;
    typingChannelRef.current.track({
      user_id: user.id,
      typing,
    });
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-linear-to-br from-white to-zinc-50 px-6">
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
              className={`w-11 h-11 rounded-2xl bg-linear-to-br ${getAvatarColor(
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
            {isTyping && (
              <p className="text-xs text-zinc-500 animate-pulse">Typing...</p>
            )}
          </div>
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
            receiverId={selectedUser.id}
            onMessageSent={() => {}}
            onTyping={broadcastTyping}
          />
        </div>
      )}
    </div>
  );
}