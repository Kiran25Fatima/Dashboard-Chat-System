"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageListSkeleton from "@/components/skeletons/MessageListSkeleton";
import type { ReactNode } from "react";
import { formatTime, formatDateLabel, isSameDay } from "@/lib/utils/format";
import useCurrentUser from "@/hooks/useCurrentUser";
import MessageActions from "@/components/chat/MessageActions";
import VoiceMessageBubble from "@/components/chat/VoiceMessageBubble";


const SENDER_COLORS = [
  "#7c3aed", // purple
  "#0ea5e9", // sky blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#06b6d4", // cyan
];

const getSenderColor = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return SENDER_COLORS[Math.abs(hash) % SENDER_COLORS.length];
};

export default function MessageList({
  conversationId,
  groupId,
  searchTerm,
  searchIndex,
  currentUserId,
  setSearchIndex,
  messageRefs,
   selectedConversation,
}: any) {
  const [messages, setMessages] = useState<any[]>([]);
 
  
  const [isLoading, setIsLoading] = useState(true);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});




  const bottomRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(0);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  const prevConversationIdRef = useRef<string | null>(null);

  const filteredMessages = searchTerm
  ? messages.filter((msg) =>
     !msg.deleted_at &&
msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : messages;
 const matches = searchTerm
  ? messages.filter((msg) =>
      !msg.deleted_at &&
msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

 

useEffect(() => {
  notificationSoundRef.current = new Audio("/sounds/message.mp3");
  notificationSoundRef.current.volume = 0.7;
}, []);



  const markMessagesRead = async (messageId?: string) => {
    if (!conversationId || !currentUserId) return;

    const updateQuery = supabase
      .from("messages")
      .update({
        is_read: true,
        status: "seen",
        read_at: new Date().toISOString(),
      })
      .eq("conversation_id", conversationId)
      .eq("receiver_id", currentUserId)
      .eq("status", "delivered")

    if (messageId) {
      updateQuery.eq("id", messageId);
    }

    await updateQuery;
  };

const fetchMessages = async () => {
  const id = groupId || conversationId;
  if (!id) {
    setMessages([]);
    setIsLoading(false);
    return;
  }

  if (prevConversationIdRef.current !== id) {
    setMessages([]);
    setIsLoading(true);
    prevConversationIdRef.current = id;
  }

  const query = supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: true });

  if (groupId) {
    query.eq("group_id", groupId);
  } else {
    query.eq("conversation_id", conversationId);
  }

  const { data } = await query;
  setMessages(data || []);
  setIsLoading(false);

  if (groupId && data && data.length > 0) {
  const senderIds = [...new Set(data.map((m: any) => m.sender_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", senderIds);

  const map: Record<string, string> = {};
  (profiles || []).forEach((p: any) => { map[p.id] = p.full_name; });
  setProfileMap(map);
}
};

  useEffect(() => {
  fetchMessages();
}, [conversationId, groupId]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;
const channelId = groupId || conversationId;
const filterKey = groupId ? "group_id" : "conversation_id";

const channel = supabase
  .channel(`messages-${channelId}`)
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages",
      filter: `${filterKey}=eq.${channelId}`,
    },
    async (payload) => {
      const msg = payload.new;

      // for DMs only: mark seen + play sound for receiver
      if (!groupId && msg.receiver_id === currentUserId) {
        notificationSoundRef.current?.play();
        setMessages((prev) => [...prev, { ...msg, status: "delivered" }]);
        supabase.from("messages").update({ is_read: true, status: "seen", read_at: new Date().toISOString() })
          .eq("id", msg.id).then(() => {});
        return;
      }

      // for groups: play sound for everyone except sender
      if (groupId && msg.sender_id !== currentUserId) {
        notificationSoundRef.current?.play();
      }

      setMessages((prev) => [...prev, msg]);

      if (groupId && msg.sender_id !== currentUserId) {
  setProfileMap((prev) => {
    if (prev[msg.sender_id]) return prev;
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("id", msg.sender_id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfileMap((p) => ({ ...p, [data.id]: data.full_name }));
        }
      });
    return prev;
  });
}
    }
  )
      .on(
  "postgres_changes",
  {
    event: "UPDATE",
    schema: "public",
    table: "messages",
    filter: `${filterKey}=eq.${channelId}`,
  },
        (payload) => {
          setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, groupId, currentUserId]);


useEffect(() => {
  if (!conversationId || !currentUserId || groupId) return;
  const run = async () => {
    await supabase
      .from("messages")
      .update({ is_read: true, status: "seen", read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("receiver_id", currentUserId)
      .eq("is_read", false);
  };
  run();
}, [conversationId, groupId, currentUserId]);

const deleteForEveryone = async (messageId: string) => {
  await supabase
    .from("messages")
    .update({
      deleted_at: new Date().toISOString(),
      message: "This message was deleted",
    })
    .eq("id", messageId)
    .eq("sender_id", currentUserId);
};

 useEffect(() => {
  const currentLen = messages.length;

  // only scroll when a message is added
  if (currentLen > prevLen.current) {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
      block: "end",
    });
  }

  prevLen.current = currentLen;
}, [messages]);
  useEffect(() => {
  if (!searchTerm || matches.length === 0) return;

  const safeIndex = searchIndex % matches.length;
  const target = matches[safeIndex]?.id;

  if (target && messageRefs.current[target]) {
    messageRefs.current[target].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, [searchIndex, searchTerm, messages]);


  if (isLoading) {
    return <MessageListSkeleton />;
  }

  if (messages.length === 0) {
    const isGroup = !!groupId || selectedConversation?.isGroup;
    const displayName = isGroup
      ? selectedConversation?.name || "the group"
      : selectedConversation?.partner?.full_name || "your contact";

    return (
      <div
        className="h-full flex flex-col items-center justify-center px-8 py-16 text-center select-none"
        style={{
          background: "transparent",
        }}
      >
        <div className="relative mb-6">
          {/* Subtle background glow */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-10"
            style={{
              background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
              transform: "scale(1.7)",
            }}
          />
          
          {/* Friendly visual ring - Scaled up */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.02) 0%, rgba(139,92,246,0.06) 100%)",
              border: "1px solid rgba(139,92,246,0.10)",
              boxShadow: "0 6px 24px rgba(109,40,217,0.02)",
            }}
          >
            <span className="text-3xl">👋</span>
          </div>
        </div>

        {/* Title - Scaled up to text-base / text-lg */}
        <h3
  className="text-base md:text-lg font-bold mb-2 tracking-tight"
  style={{ color: "#1e1b4b", letterSpacing: "-0.01em" }}
>
  Say hello to {displayName}
</h3>

        {/* Supporting description - Scaled up to text-sm */}
        <p
  className="text-xs sm:text-sm max-w-[320px] leading-relaxed"
  style={{ color: "#64748b" }}
>
          This is the very beginning of your conversation history. Send a message to start the conversation.
        </p>

        {/* Elegant divider */}
        <div
          className="h-px w-16 mt-8 animate-pulse"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)",
          }}
        />
      </div>
    );
  }

  
  const rendered: ReactNode[] = [];
  let prevSenderId = "";

 filteredMessages.forEach((msg, i) => {

  const isMatch =
  searchTerm &&
  msg.message?.toLowerCase().includes(searchTerm.toLowerCase());
const isVoiceMessage = !!msg.voice_url;

  const isActiveMatch =
  isMatch &&
  matches[searchIndex % matches.length]?.id === msg.id;
    const isMe = msg.sender_id === currentUserId;

    const showDateDivider =
      i === 0 || !isSameDay(msg.created_at, filteredMessages[i - 1].created_at);

    const isGrouped = msg.sender_id === prevSenderId && !showDateDivider;

    // system message — render centered and skip normal bubble
if (msg.message_type === "system") {
  rendered.push(
    <div key={msg.id} className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 h-px" style={{ background: "rgba(139,92,246,0.10)" }} />
      <span
        className="text-[11px] font-medium px-3 py-1.5 rounded-full text-center"
        style={{
          color: "#9585b8",
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.10)",
          maxWidth: "80%",
        }}
      >
        {msg.message}
      </span>
      <div className="flex-1 h-px" style={{ background: "rgba(139,92,246,0.10)" }} />
    </div>
  );
  prevSenderId = msg.sender_id;
  return;
}

    const senderName = groupId && !isMe ? (profileMap[msg.sender_id] || "Unknown") : null;
    const senderColor = groupId && !isMe ? getSenderColor(msg.sender_id) : "#7c3aed";

    const isLast =
      i === filteredMessages.length - 1 ||
      filteredMessages[i + 1].sender_id !== msg.sender_id;

   
    if (showDateDivider) {
      rendered.push(
        <div key={`date-${msg.id}`} className="flex items-center gap-3 px-4 py-5">
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)" }} />
          <span
            className="px-3.5 py-1 text-[11px] font-semibold tracking-wide"
            style={{
              borderRadius: "20px",
              background: "rgba(255,255,255,0.9)",
              border: "1px solid rgba(139,92,246,0.13)",
              color: "#9585b8",
              boxShadow: "0 1px 6px rgba(109,40,217,0.06)",
              letterSpacing: "0.04em",
            }}
          >
            {formatDateLabel(msg.created_at)}
          </span>
          <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)" }} />
        </div>
      );
    }

    const isImageOnly = !!msg.file_url && msg.file_type?.startsWith("image/") && !msg.message;
    rendered.push(
     <div
  key={msg.id}
  ref={(el) => {
    messageRefs.current[msg.id] = el;
  }}
  className={`flex ${isGrouped ? "mt-1" : "mt-4"} ${isMe ? "justify-end" : "justify-start"}`}
>
     <div
  className={`
    group relative
    flex flex-col
    max-w-[78%] md:max-w-[60%]
    ${isMe ? "items-end self-end" : "items-start self-start"}
  `}

>
 {senderName && !isGrouped && (
  <p
    className="text-[11px] font-semibold mb-1 px-1"
    style={{ color: senderColor }}
  >
    {senderName}
  </p>
)}
<div className="relative w-full">
{isMe && !msg.deleted_at && (
 <div
    className="
      absolute
      top-2
      opacity-0
      group-hover:opacity-100
      transition-all duration-150
      z-20
    "
    style={{
      right: "100%",
      marginRight: "8px",
    }}
  >
    
    <MessageActions
      onDeleteForEveryone={() =>
        deleteForEveryone(msg.id)
      }
    />
  </div>
)}



<div
  className="relative px-4 py-2.5 text-[14.5px] leading-relaxed wrap-break-words transition-all duration-200"
  style={
    isImageOnly
      ? {
          background: "transparent",
          padding: "0",
          boxShadow: "none",
          border: "none",
          borderRadius: "16px",
        }
      : isMe
      ? {
          background: msg.deleted_at ? "transparent" : "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
          border: msg.deleted_at ? "1px dashed rgba(124,58,237,0.35)" : "none",
          color: msg.deleted_at ? "rgba(124,58,237,0.6)" : "#ffffff",
          opacity: msg.deleted_at ? 0.9 : 1,
          fontWeight: msg.deleted_at ? 500 : 400,
          borderRadius: isLast ? "20px 20px 6px 20px" : "20px",
          boxShadow: isActiveMatch
  ? "0 4px 16px rgba(124,58,237,0.18), 0 0 0 3px rgba(139,92,246,0.20)"
  : "0 3px 12px rgba(124,58,237,0.12), 0 1px 3px rgba(124,58,237,0.08)",
          outline: "none",
          backdropFilter: msg.deleted_at ? "blur(8px)" : undefined,
        }
      : {
          background: msg.deleted_at ? "#f4f1fb" : "rgba(255,255,255,0.95)",
          color: "#1e0a3c",
          border: "1px solid rgba(139,92,246,0.12)",
          borderRadius: isLast ? "20px 20px 20px 6px" : "20px",
          boxShadow: isActiveMatch
  ? "0 2px 12px rgba(109,40,217,0.06), 0 0 0 3px rgba(139,92,246,0.18)"
  : "0 2px 10px rgba(109,40,217,0.04), 0 1px 2px rgba(0,0,0,0.02)",
          outline: "none",
          backdropFilter: msg.deleted_at ? "blur(8px)" : undefined,
        }
  }
>
{msg.deleted_at ? (
  <div
    className="flex items-center gap-2 select-none"
    style={{
      fontSize: "13px",
      fontStyle: "italic",
      color: isMe ? "rgba(124,58,237,0.6)" : "var(--color-text-tertiary, #9ca3af)",
      lineHeight: 1.4,
    }}
  >
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none"
      stroke="currentColor" strokeWidth="1.8" style={{ flexShrink: 0, opacity: 0.8 }}>
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 8v4m0 4h.01"/>
    </svg>
    <span>{isMe ? "You deleted this message" : "This message was deleted"}</span>
  </div>
) : (
  <>
  {msg.voice_url && (
  <div style={{ minWidth: "240px" }}>
    <VoiceMessageBubble
      src={msg.voice_url}
      duration={msg.voice_duration || 0}
      isMe={isMe}
    />
  </div>
)}

  {msg.message && (
    <div className={msg.voice_url ? "mt-2" : ""}>
      {msg.message}
    </div>
  )}

  {msg.file_url && (
   <div className={isImageOnly ? "" : "mt-2"}>
    {msg.file_type?.startsWith("image/") ? (
      <img
        src={msg.file_url}
        alt="image"
        className="rounded-xl cursor-pointer"
style={{ display: "block", maxWidth: "280px", width: "100%" }}
        onClick={() => window.open(msg.file_url, "_blank")}
      />
    ) : (
      
       <a href={msg.file_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 14px",
          borderRadius: "12px",
          background: isMe ? "rgba(255,255,255,0.15)" : "rgba(139,92,246,0.07)",
          border: isMe ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(139,92,246,0.15)",
          textDecoration: "none",
          maxWidth: "220px",
        }}
      >
        {/* File icon based on type */}
        <div style={{
          width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
          background: isMe ? "rgba(255,255,255,0.2)" : "rgba(139,92,246,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" fill="none" stroke={isMe ? "#fff" : "#7c3aed"} strokeWidth="1.8" viewBox="0 0 24 24">
            {msg.file_type === "application/pdf" ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            )}
          </svg>
        </div>

        <div style={{ overflow: "hidden", flex: 1 }}>
          <p style={{
            margin: 0, fontSize: "13px", fontWeight: 500,
            color: isMe ? "#fff" : "#1e0a3c",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {msg.file_name || "File"}
          </p>
          <p style={{
            margin: 0, fontSize: "11px",
            color: isMe ? "rgba(255,255,255,0.65)" : "rgba(109,40,217,0.55)",
          }}>
            {msg.file_type === "application/pdf" ? "PDF" :
             msg.file_type?.includes("word") ? "Word doc" :
             msg.file_type?.split("/")[1]?.toUpperCase() || "File"} · tap to open
          </p>
        </div>

        <svg width="14" height="14" fill="none" stroke={isMe ? "rgba(255,255,255,0.7)" : "#9333ea"} strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    )}
  </div>
)}
</>
)}
</div>
</div>

          {/* Timestamp + status */}
         {isLast && (
  <div
    className={`flex items-center gap-1 mt-1 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}
  >

    <span
      style={{
        fontSize: "10.5px",
        fontWeight: 500,
        color: isMe ? "rgba(139,92,246,0.55)" : "#c4b5fd",
        letterSpacing: "0.01em",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {formatTime(msg.created_at)}
    </span>

   
    {isMe && (
      <span className="inline-flex items-center" style={{ marginLeft: "1px" }}>

      
        {msg.status === "sent" && (
          <svg
            viewBox="0 0 16 16"
            style={{ width: "14px", height: "14px", color: "rgba(139,92,246,0.40)" }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2.5 8.5L6 12L13.5 4.5" />
          </svg>
        )}

      
        {msg.status === "delivered" && (
          <svg
            viewBox="0 0 20 16"
            style={{ width: "18px", height: "14px", color: "rgba(139,92,246,0.40)" }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1.5 8.5L5 12L12.5 4.5" />
            <path d="M7.5 8.5L11 12L18.5 4.5" />
          </svg>
        )}

       
        {msg.status === "seen" && (
          <svg
            viewBox="0 0 20 16"
            style={{ width: "18px", height: "14px", color: "#7c3aed" }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1.5 8.5L5 12L12.5 4.5" />
            <path d="M7.5 8.5L11 12L18.5 4.5" />
          </svg>
        )}

      </span>
    )}
  </div>
)}
           
        </div>
      </div>
    );

    prevSenderId = msg.sender_id;
  });

  return (
    <div
      className="flex flex-col min-h-full"
style={{
  background: "#FAF9FD", // Solid elegant off-white (prevents scrolling color-shift)
}}
    >
     <div className="flex flex-col py-1 px-2 md:px-4 lg:px-6">{rendered}</div>
      <div ref={bottomRef} className="h-1 shrink-0" />
    </div>
  );
}