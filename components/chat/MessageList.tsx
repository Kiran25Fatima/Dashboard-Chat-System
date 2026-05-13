"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ReactNode } from "react";

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

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(ts: string) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function MessageList({ conversationId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setCurrentUserId(data.user.id);
    };
    getUser();
  }, []);

  const fetchMessages = async () => {
    if (!conversationId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

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
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8 py-12 bg-white">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-4 shadow">
          <svg
            className="w-7 h-7 text-zinc-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-zinc-900">
          No messages yet
        </h3>
        <p className="text-sm text-zinc-500 mt-1 max-w-xs">
          Say hello — messages are delivered in real time.
        </p>
      </div>
    );
  }

  const rendered: React.ReactNode[] = [];
  let prevSenderId = "";

  messages.forEach((msg, i) => {
    const isMe = msg.sender_id === currentUserId;
    const showDateDivider =
      i === 0 || !isSameDay(msg.created_at, messages[i - 1].created_at);
    const isGrouped = msg.sender_id === prevSenderId && !showDateDivider;
    const isLast =
      i === messages.length - 1 ||
      messages[i + 1].sender_id !== msg.sender_id;

    if (showDateDivider) {
      rendered.push(
        <div key={`date-${msg.id}`} className="flex items-center gap-3 px-4 py-3">
          <div className="flex-1 h-px bg-zinc-200" />
          <span className="text-[11px] font-medium text-zinc-500 px-2">
            {formatDateLabel(msg.created_at)}
          </span>
          <div className="flex-1 h-px bg-zinc-200" />
        </div>
      );
    }

    rendered.push(
      <div
        key={msg.id}
        className={`flex items-end gap-2.5 px-4 ${
          isGrouped ? "mt-0.5" : "mt-3"
        } ${isMe ? "flex-row-reverse" : ""}`}
      >
        {!isMe && <div className="w-2 shrink-0" />}

        <div
          className={`flex flex-col ${
            isMe ? "items-end" : "items-start"
          } max-w-[72%]`}
        >
          <div
            className={`px-4 py-2.5 text-sm leading-relaxed wrap-break-words ${
              isMe
                ? `bg-violet-600 text-white shadow ${
                    isGrouped
                      ? "rounded-2xl rounded-br-md"
                      : isLast
                      ? "rounded-2xl rounded-br-md"
                      : "rounded-2xl"
                  }`
                : `bg-white text-zinc-900 border border-zinc-200 ${
                    isGrouped
                      ? "rounded-2xl rounded-bl-md"
                      : isLast
                      ? "rounded-2xl rounded-bl-md"
                      : "rounded-2xl"
                  }`
            }`}
          >
            {msg.message}
          </div>

          {isLast && (
            <span className="text-[10px] text-zinc-500 mt-1 px-1">
              {formatTime(msg.created_at)}
            </span>
          )}
        </div>
      </div>
    );
    prevSenderId = msg.sender_id;
  });

  return (
    <div className="flex flex-col py-2 bg-white">
      {rendered}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}