"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatWindowSkeleton from "../skeletons/ChatWindowSkeleton";

import Avatar from "../ui/Avatar";
import useCurrentUser from "../../hooks/useCurrentUser";

// ✅ Helper: deduplicate presence entries by user_id (last entry wins)
const getLatestPerUser = (all: any[]) =>
  Object.values(
    all.reduce((acc: any, p: any) => {
      acc[p.user_id] = p;
      return acc;
    }, {})
  ) as any[];

export default function ChatWindow({ selectedConversation }: any) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ✅ Single typing channel instance lives here (lifted up from MessageInput)
  const typingChannelRef = useRef<any>(null);
  const channelReadyRef = useRef(false);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { user: currentUser } = useCurrentUser();
  // keep local `user` state in sync with hook
  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
    if (!selectedConversation?.id || !user?.id) {
      setConversationId(null);
      setLoading(false);
      return;
    }

    const conversationId = selectedConversation.id;
    setConversationId(conversationId);
    setLoading(true);

    const markMessagesRead = async () => {
      await supabase
        .from("messages")
        .update({
          is_read: true,
          status: "seen",
          read_at: new Date().toISOString(),
        })
        .eq("conversation_id", conversationId)
        .eq("receiver_id", user.id)
        .eq("is_read", false);
    };

    markMessagesRead().finally(() => setLoading(false));
  }, [selectedConversation, user]);

  // ✅ Only ONE channel is created here — shared with MessageInput via broadcastTyping prop
  useEffect(() => {
    if (!conversationId || !selectedConversation?.partner || !user) return;

    let channel: any = null;

    const init = async () => {
     
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
  }, [conversationId, selectedConversation, user]);

  // ✅ This function is passed down to MessageInput so it uses the same channel
  const broadcastTyping = (typing: boolean) => {
    if (!typingChannelRef.current || !user) return;
    typingChannelRef.current.track({
      user_id: user.id,
      typing,
    });
  };

  const isPreparing = !!selectedConversation && (!user || loading || conversationId === null);

  if (!selectedConversation) {
    return (
      <div
        className="flex-1 flex items-center justify-center px-6"
        style={{
          background: "linear-gradient(160deg, #fdfcff 0%, #f5f0ff 50%, #faf8ff 100%)",
        }}
      >
        <div className="max-w-xs text-center">
          
          <div className="relative mx-auto mb-8 w-24 h-24">
            <div
              className="absolute inset-0 rounded-3xl opacity-40"
              style={{
                background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)",
                filter: "blur(20px)",
                transform: "scale(1.4)",
              }}
            />
            <div
              className="relative w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, #ffffff 0%, #f5f0ff 100%)",
                boxShadow: "0 0 0 1px rgba(139,92,246,0.12), 0 8px 32px rgba(109,40,217,0.10)",
              }}
            >
              <svg
                className="w-10 h-10"
                style={{ color: "#8b5cf6" }}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
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

          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: "#2e1065", fontFamily: "'DM Sans', sans-serif" }}
          >
            Your Messages
          </h2>
          <p className="text-sm mt-2.5 leading-relaxed" style={{ color: "#9585b8" }}>
            Select a conversation from the sidebar to start chatting.
          </p>

      
          <div className="flex items-center justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: i === 1 ? "#8b5cf6" : "#ddd6fe",
                  transform: i === 1 ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isPreparing) {
    return <ChatWindowSkeleton />;
  }

  return (
    <div
      className="flex-1 flex flex-col min-h-0"
      style={{ background: "#ffffff" }}
    >

      <div
        className="shrink-0 px-5 py-3.5 flex items-center justify-between"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(250,247,255,0.98) 100%)",
          borderBottom: "1px solid rgba(139,92,246,0.09)",
          boxShadow: "0 2px 16px rgba(109,40,217,0.05)",
        }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar name={selectedConversation?.partner?.full_name} size={40} />
          </div>

       
          <div className="min-w-0">
            <h2
              className="text-sm font-bold truncate"
              style={{ color: "#2e1065", letterSpacing: "-0.01em" }}
            >
              {selectedConversation?.partner?.full_name}
            </h2>
            {isTyping && (
  <p className="text-xs font-medium animate-pulse" style={{ color: "#8b5cf6" }}>
    Typing…
  </p>
)}
          </div>
        </div>

      
        <div className="flex items-center gap-2">
          {/* <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(139,92,246,0.06)",
              border: "1px solid rgba(139,92,246,0.10)",
            }}
          >
            <svg className="w-4 h-4" style={{ color: "#8b5cf6" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
            </svg>
          </div> */}
        </div>
      </div>

  
      <div
  className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24"
  style={{
    background: "linear-gradient(180deg, #fdfcff 0%, #f9f7ff 60%, #ffffff 100%)",
  }}
>
        <MessageList conversationId={conversationId!} />
      </div>

     
      {user && (
        <div
  className="shrink-0 px-3 md:px-4 py-3"
  style={{
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(12px)",
    borderTop: "1px solid rgba(139,92,246,0.10)",
    boxShadow: "0 -10px 30px rgba(109,40,217,0.06)",
  }}
>
  <div
  className="h-px w-full"
  style={{
    background:
      "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)",
  }}
/>
          <MessageInput
            conversationId={conversationId}
            senderId={user.id}
            receiverId={selectedConversation?.partner?.id}
            onMessageSent={() => {}}
            onTyping={broadcastTyping}
          />
        </div>
      )}
    </div>
  );

}