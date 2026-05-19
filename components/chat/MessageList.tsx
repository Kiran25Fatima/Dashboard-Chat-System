"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageListSkeleton from "@/components/skeletons/MessageListSkeleton";
import type { ReactNode } from "react";
import { formatTime, formatDateLabel, isSameDay } from "@/lib/utils/format";
import useCurrentUser from "@/hooks/useCurrentUser";

export default function MessageList({
  conversationId,
  searchTerm,
  searchIndex,
  currentUserId,
  setSearchIndex,
  messageRefs,
}: any) {
  const [messages, setMessages] = useState<any[]>([]);
 
  
  const [isLoading, setIsLoading] = useState(true);




  const bottomRef = useRef<HTMLDivElement>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  const prevConversationIdRef = useRef<string | null>(null);

  const filteredMessages = searchTerm
  ? messages.filter((msg) =>
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  : messages;
 const matches = searchTerm
  ? messages.filter((msg) =>
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
  if (!conversationId) {
    setMessages([]);
    setIsLoading(false);
    return;
  }

  if (prevConversationIdRef.current !== conversationId) {
    setMessages([]);
    setIsLoading(true);
    prevConversationIdRef.current = conversationId;
  }

  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  setMessages(data || []);
  setIsLoading(false);
};

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const msg = payload.new;

         if (msg.receiver_id === currentUserId) {

  notificationSoundRef.current?.play();

  setMessages((prev) => [
    ...prev,
    { ...msg, status: "delivered" },
  ]);

  return;
}

          setMessages((prev) => [...prev, msg]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => prev.map(m => m.id === payload.new.id ? payload.new : m));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);


useEffect(() => {
  if (!conversationId || !currentUserId) return;
  const run = async () => {
    await supabase
      .from("messages")
      .update({ is_read: true, status: "seen", read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .eq("receiver_id", currentUserId)
      .eq("is_read", false);
  };
  run();
}, [conversationId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages.length]);
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
    return (
      <div
        className="h-full flex items-center justify-center px-6"
        style={{
          background: "linear-gradient(160deg, #fdfcff 0%, #f5f0ff 50%, #faf8ff 100%)",
        }}
      >
        <div className="max-w-xs text-center">
          <div className="relative mx-auto mb-8 w-24 h-24">
            <div
              className="absolute inset-0 rounded-3xl opacity-50"
              style={{
                background: "radial-gradient(circle, #a78bfa 0%, transparent 70%)",
                filter: "blur(22px)",
                transform: "scale(1.5)",
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
            No messages yet
          </h2>
          <p className="text-sm mt-2.5 leading-relaxed" style={{ color: "#9585b8" }}>
            Start the conversation by sending your first message.
          </p>

          <div className="flex items-center justify-center gap-2 mt-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: i === 1 ? "8px" : "6px",
                  height: i === 1 ? "8px" : "6px",
                  background: i === 1 ? "#8b5cf6" : "#ddd6fe",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  
  const rendered: ReactNode[] = [];
  let prevSenderId = "";

 filteredMessages.forEach((msg, i) => {

  const isMatch =
  searchTerm &&
  msg.message?.toLowerCase().includes(searchTerm.toLowerCase());


  const isActiveMatch =
  isMatch &&
  matches[searchIndex % matches.length]?.id === msg.id;
    const isMe = msg.sender_id === currentUserId;

    const showDateDivider =
      i === 0 || !isSameDay(msg.created_at, filteredMessages[i - 1].created_at);

    const isGrouped = msg.sender_id === prevSenderId && !showDateDivider;

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

    
    rendered.push(
     <div
  key={msg.id}
  ref={(el) => {
    messageRefs.current[msg.id] = el;
  }}
  className={`flex ${isGrouped ? "mt-0.5" : "mt-3"} ${isMe ? "justify-end" : "justify-start"}`}
>
        <div
          className={`flex flex-col max-w-[78%] md:max-w-[60%] ${isMe ? "items-end" : "items-start"}`}
        >
         
 <div
  className="relative px-4 py-2.5 text-[14.5px] leading-relaxed wrap-break-words"
  style={
    isMe
      ? {
          background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
          color: "#ffffff",
          borderRadius: isLast ? "20px 20px 6px 20px" : "20px",
          boxShadow: isActiveMatch
            ? "0 4px 16px rgba(124,58,237,0.28), 0 0 0 3px rgba(139,92,246,0.25)"
            : "0 4px 16px rgba(124,58,237,0.28), 0 1px 4px rgba(124,58,237,0.15)",
          outline: "none",
        }
      : {
          background: "rgba(255,255,255,0.95)",
          color: "#1e0a3c",
          border: "1px solid rgba(139,92,246,0.12)",
          borderRadius: isLast ? "20px 20px 20px 6px" : "20px",
          boxShadow: isActiveMatch
            ? "0 2px 12px rgba(109,40,217,0.07), 0 0 0 3px rgba(139,92,246,0.25)"
            : "0 2px 12px rgba(109,40,217,0.07), 0 1px 3px rgba(109,40,217,0.04)",
          outline: "none",
        }
  }
>
  {msg.message}
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
        background: "linear-gradient(180deg, #fdfcff 0%, #f8f5ff 40%, #fdfcff 100%)",
      }}
    >
      <div className="flex flex-col py-3 px-5 md:px-14 lg:px-24">{rendered}</div>
      <div ref={bottomRef} className="h-5 shrink-0" />
    </div>
  );
}