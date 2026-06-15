"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatWindowSkeleton from "../skeletons/ChatWindowSkeleton";

import Avatar from "../ui/Avatar";
import useCurrentUser from "../../hooks/useCurrentUser";
import usePresence from "@/hooks/usePresence";
import { X } from "lucide-react";
import { formatLastSeen } from "@/lib/utils/format";
import GroupInfoModal from "@/components/features/GroupInfoModal"; 

// ✅ Helper: deduplicate presence entries by user_id (last entry wins)
const getLatestPerUser = (all: any[]) =>
  Object.values(
    all.reduce((acc: any, p: any) => {
      acc[p.user_id] = p;
      return acc;
    }, {})
  ) as any[];

export default function ChatWindow({ selectedConversation,onLeaveGroup,onGroupUpdated  }: any) {
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
  const selectedPartnerId = selectedConversation?.partner?.id ?? null;
  const { onlineMap, lastSeenMap } = usePresence(currentUser, selectedPartnerId ? [selectedPartnerId] : []);
  const lastSeen = selectedPartnerId ? lastSeenMap[selectedPartnerId] : null;
  const isPartnerOnline = !!selectedPartnerId && !!onlineMap[selectedPartnerId];
  const hasLastSeen = !!lastSeen;
  const showLastSeen = !isTyping && !isPartnerOnline && hasLastSeen;
  const [showMembers, setShowMembers] = useState(false);
    const [memberCount, setMemberCount] = useState<number | null>(null);
  // keep local `user` state in sync with hook
  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  useEffect(() => {
  if (!selectedConversation?.isGroup) {
    setMemberCount(null);
    return;
  }

  supabase
    .from("group_members")
    .select("id", { count: "exact" })
    .eq("group_id", selectedConversation.id)
    .then(({ count }) => {
      setMemberCount(count);
    });
}, [selectedConversation?.id, selectedConversation?.isGroup]);

  useEffect(() => {
    if (!selectedConversation?.id || !user?.id) {
      setConversationId(null);
      setLoading(false);
      return;
    }

    const conversationId = selectedConversation.id;
    setConversationId(conversationId);
    setLoading(false);

//     const markMessagesRead = async () => {
//       await supabase
//         .from("messages")
//         .update({
//           is_read: true,
//           status: "seen",
//           read_at: new Date().toISOString(),
//         })
//         .eq("conversation_id", conversationId)
//         .eq("receiver_id", user.id)
//         .eq("is_read", false)
//         .eq("status", "delivered")
//     };

//     const run = async () => {
//   await new Promise(r => setTimeout(r, 500));
//   await markMessagesRead();
//   setLoading(false);
// };
// run();
  }, [selectedConversation?.id, user?.id]);

 useEffect(() => {
  const cid = selectedConversation?.id;
  const uid = user?.id;
  if (!cid || !uid || selectedConversation?.isGroup) return; // skip for groups

  supabase
    .from("messages")
    .update({ status: "delivered" })
    .eq("conversation_id", cid)
    .eq("receiver_id", uid)
    .eq("status", "sent")
    .then(() => {});

  const timer = setTimeout(async () => {
    await supabase
      .from("messages")
      .update({ is_read: true, status: "seen", read_at: new Date().toISOString() })
      .eq("conversation_id", cid)
      .eq("receiver_id", uid)
      .eq("is_read", false);
  }, 500);

  return () => clearTimeout(timer);
}, [selectedConversation?.id, user?.id]);
  // ✅ Only ONE channel is created here — shared with MessageInput via broadcastTyping prop
  useEffect(() => {
    if (!conversationId || !selectedConversation?.partner || !user || selectedConversation?.isGroup) return;

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
        className="flex-1 flex flex-col items-center justify-center px-8"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #fcfbfe 60%, #f6f4fa 100%)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div className="w-full max-w-115 text-center flex flex-col items-center">
          {/* Main Visual Container - Scaled Up */}
          <div className="relative mb-8">
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-25"
              style={{
                background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
                transform: "scale(1.6)",
              }}
            />
            <div
              className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(124,58,237,0.04) 0%, rgba(139,92,246,0.08) 100%)",
                border: "1px solid rgba(139,92,246,0.12)",
                boxShadow: "0 8px 30px rgba(109,40,217,0.04)",
              }}
            >
              <svg
                className="w-10 h-10"
                style={{ color: "#7c3aed" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.084.29.125.597.125.913 0 3.73-4.03 6.75-9 6.75a10.02 10.02 0 0 1-2.245-.254c-.554.341-1.18.57-1.848.675a.75.75 0 0 1-.865-.67 4.28 4.28 0 0 0 .56-1.573c-.092-.12-.18-.246-.264-.378C5.231 12.35 4.5 10.99 4.5 9.5c0-3.73 4.03-6.75 9-6.75 4.312 0 7.9 2.296 8.75 5.761Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.75 13.5c0 3.73-4.03 6.75-9 6.75a10.02 10.02 0 0 1-2.245-.254c-.554.341-1.18.57-1.848.675a.75.75 0 0 1-.865-.67 4.28 4.28 0 0 0 .56-1.573c-.092-.12-.18-.246-.264-.378C3.231 16.35 2.5 14.99 2.5 13.5c0-2.31 1.55-4.32 3.84-5.462"
                />
              </svg>
            </div>
          </div>

          {/* Title - Scaled to text-xl */}
          <h2
            className="text-xl md:text-2xl font-bold tracking-tight mb-3"
            style={{ color: "#3b0764", letterSpacing: "-0.02em" }}
          >
            Welcome to your workspace
          </h2>

          {/* Supporting Text - Scaled to text-base */}
          <p className="text-sm md:text-base leading-relaxed mb-8" style={{ color: "#7c728a" }}>
            Select an active chat from the sidebar panel or search for an associate to begin sending messages.
          </p>

          {/* Quick Actions Guide - Scaled Up text */}
          <div
            className="w-full rounded-2xl p-5 text-left border"
            style={{
              background: "rgba(255, 255, 255, 0.5)",
              borderColor: "rgba(139, 92, 246, 0.08)",
            }}
          >
            <span
              className="text-xs font-bold tracking-wider uppercase block mb-3.5"
              style={{ color: "#9a82db" }}
            >
              Quick Navigation Tips
            </span>
            <ul className="space-y-3.5 text-sm" style={{ color: "#5c526d" }}>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#a78bfa" }} />
                <span>
                  Click{" "}
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold mx-0.5"
                    style={{ background: "#ede9fe", color: "#6d28d9" }}
                  >
                    + New Chat
                  </span>{" "}
                  to find contacts.
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#a78bfa" }} />
                <span>
                  Click{" "}
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold mx-0.5"
                    style={{ background: "#ede9fe", color: "#6d28d9" }}
                  >
                    New Group
                  </span>{" "}
                  to start collaborative channels.
                </span>
              </li>
            </ul>
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
  background: "#ffffff",
  borderBottom: "1px solid #f1f5f9", // Crisp, clean border separation
  boxShadow: "0 2px 12px rgba(15, 23, 42, 0.03)", // Soft, modern neutral shadow
}}
      >
    <button
  onClick={() => { if (selectedConversation?.isGroup) setShowMembers(true); }}
  className={`flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 overflow-hidden text-left transition-opacity
    ${selectedConversation?.isGroup ? "cursor-pointer hover:opacity-75" : "cursor-default"}`}
>
          {/* Avatar */}
          <div className="relative shrink-0">
       {selectedConversation?.isGroup && selectedConversation?.avatar_url ? (
  <img
    src={selectedConversation.avatar_url}
    alt="group"
    className="w-10 h-10 rounded-full object-cover"
    style={{ boxShadow: "0 2px 8px rgba(124,58,237,0.20)" }}
  />
) : (
  <Avatar
    name={selectedConversation?.isGroup ? selectedConversation?.name : selectedConversation?.partner?.full_name}
    size={40}
  />
)}
          </div>

       
          <div className="min-w-0 flex-1 overflow-hidden">
         <h2 className="text-sm font-bold truncate">
  {selectedConversation?.isGroup
    ? selectedConversation?.name
    : selectedConversation?.partner?.full_name}
</h2>

{selectedConversation?.isGroup ? (
  <p className="text-xs font-medium" style={{ color: "#b8acd6" }}>
  {memberCount !== null ? `${memberCount} members` : "Group"}
</p>
) : isTyping ? (
  <p className="text-xs font-medium animate-pulse" style={{ color: "#8b5cf6" }}>
    Typing…
  </p>
) : isPartnerOnline ? (
  <p className="text-xs font-medium" style={{ color: "#34d399" }}>
    Online
  </p>
) : showLastSeen ? (
  <p className="text-xs font-medium" style={{ color: "#b8acd6" }}>
    last seen {formatLastSeen(lastSeen)}
  </p>
) : null}
          </div>
        </button>

  



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
  className="flex-1 min-h-0 overflow-y-auto px-2 pb-5"
style={{
  background: "#FAF9FD", // Solid elegant off-white (prevents scrolling color-shift)
}}
><MessageList
  selectedConversation={selectedConversation}
  conversationId={conversationId!}
  groupId={selectedConversation?.isGroup ? selectedConversation?.id : null}
  currentUserId={currentUser?.id}
  searchTerm={searchTerm}
  searchIndex={searchIndex}
  setSearchIndex={setSearchIndex}
  messageRefs={messageRefs}
  hasMessages={!!selectedConversation?.last_message}
/>
      </div>

     
     {/* Updated Bottom Input Panel Wrapper */}
{user && (
  <div
    className="shrink-0 px-4 md:px-6 pb-5 pt-3"
    style={{
      background: "rgba(255, 255, 255, 0.90)",
      backdropFilter: "blur(12px)",
      borderTop: "1px solid #f1f5f9", // Clean, soft slate separator
      boxShadow: "0 -8px 24px rgba(15, 23, 42, 0.02)", // Neutral, soft upward shadow
    }}
  >
    {/* Clean horizontal divider line */}
    <div
      className="h-px w-full mb-3"
      style={{
        background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.12), transparent)",
      }}
    />

    <MessageInput
      conversationId={conversationId}
      senderId={user.id}
      receiverId={selectedConversation?.isGroup ? null : selectedConversation?.partner?.id}
      groupId={selectedConversation?.isGroup ? selectedConversation?.id : null}
      onMessageSent={() => {}}
      onTyping={broadcastTyping}
    />
  </div>
)}
{showMembers && selectedConversation?.isGroup && (
  <GroupInfoModal
    group={selectedConversation}
    onClose={() => setShowMembers(false)}
    onGroupUpdated={(updatedGroup: any) => {
      onGroupUpdated?.(updatedGroup);
    }}
    onLeaveGroup={(groupId: string) => {
      setShowMembers(false);
      onLeaveGroup?.(groupId);
    }}
  />
)}

    </div>
  );
}