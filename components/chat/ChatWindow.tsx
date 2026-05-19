"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatWindowSkeleton from "../skeletons/ChatWindowSkeleton";

import Avatar from "../ui/Avatar";
import useCurrentUser from "../../hooks/useCurrentUser";
import { X } from "lucide-react";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [searchIndex, setSearchIndex] = useState(0);
const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  const nextMatch = () => {
  setSearchIndex((prev) => prev + 1);
};

const prevMatch = () => {
  setSearchIndex((prev) => Math.max(prev - 1, 0));
};

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
        className="
shrink-0
px-3 sm:px-5
py-3
flex items-center
gap-3
"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(250,247,255,0.98) 100%)",
          borderBottom: "1px solid rgba(139,92,246,0.09)",
          boxShadow: "0 2px 16px rgba(109,40,217,0.05)",
        }}
      >
        <div className="
flex items-center
gap-2.5 sm:gap-3.5
min-w-0
flex-1
overflow-hidden
">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar name={selectedConversation?.partner?.full_name} size={40} />
          </div>

       
          <div className="min-w-0 flex-1 overflow-hidden">
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

 {isSearchOpen ? (
  <div
    className="
flex items-center
gap-1.5 sm:gap-2
px-2.5 sm:px-3
py-2
rounded-2xl
w-37.5
sm:w-47.5
md:w-60
lg:w-75
xl:w-85
transition-all duration-300
"
    style={{
      background: "rgba(255,255,255,0.92)",
      border: "1px solid rgba(139,92,246,0.35)",
      boxShadow:
        "0 0 0 3px rgba(139,92,246,0.12), 0 8px 24px rgba(124,58,237,0.10)",
    }}
  >
    <input
      autoFocus
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setSearchIndex(0);
      }}
      placeholder="Search messages"
     className="
bg-transparent
outline-none
text-[13px] sm:text-sm
flex-1
min-w-0
w-0
"
    />

    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
  <button
    onClick={prevMatch}
    className="
w-6 h-6
sm:w-7 sm:h-7
rounded-full
flex items-center justify-center
transition-all duration-200
hover:bg-violet-100
cursor-pointer
shrink-0
"
  >
    <svg
     className="w-3.5 h-3.5 sm:w-4 sm:h-4"
      fill="none"
      stroke="#7c3aed"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  </button>

  <button
    onClick={nextMatch}
    className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-violet-100 cursor-pointer"
  >
    <svg
      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
      fill="none"
      stroke="#7c3aed"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5l7 7-7 7"
      />
    </svg>
  </button>
</div>
    <button
      onClick={() => {
        setIsSearchOpen(false);
        setSearchTerm("");
        setSearchIndex(0);
      }}
      className="
cursor-pointer
flex items-center justify-center
w-6 h-6
sm:w-7 sm:h-7
rounded-full
hover:bg-violet-100
transition
shrink-0
"
    >
      <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600"/>
    </button>
  </div>
) : (
  <button
    onClick={() => setIsSearchOpen(true)}
    className="w-9 h-9 rounded-xl flex items-center justify-center"
    style={{
      background: "rgba(139,92,246,0.06)",
      border: "1px solid rgba(139,92,246,0.10)",
      cursor: "pointer",
    }}
  >
    <svg
      className="w-4 h-4"
      style={{ color: "#8b5cf6" }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20L17 17" />
    </svg>
  </button>
)}
      </div>

  
      <div
  className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-24"
  style={{
    background: "linear-gradient(180deg, #fdfcff 0%, #f9f7ff 60%, #ffffff 100%)",
  }}
>
        <MessageList
  conversationId={conversationId!}
  searchTerm={searchTerm}
  searchIndex={searchIndex}
  setSearchIndex={setSearchIndex}
  messageRefs={messageRefs}
   hasMessages={!!selectedConversation?.last_message} 
/>
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