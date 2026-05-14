"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ReactNode } from "react";

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(ts: string) {
  const d = new Date(ts);

  const today = new Date();

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
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

      if (data.user) {
        setCurrentUserId(data.user.id);
      }
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
          const msg = payload.new;
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
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-linear-to-b from-white to-zinc-50 px-6">

        <div className="max-w-sm text-center">

          <div className="relative mx-auto mb-6 w-24 h-24">
            <div className="absolute inset-0 rounded-3xl bg-violet-100 blur-3xl opacity-70" />

            <div className="relative w-24 h-24 rounded-3xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center">
              <svg
                className="w-10 h-10 text-violet-500"
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

          <h2 className="text-xl font-semibold text-zinc-900">
            No messages yet
          </h2>

          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
            Start the conversation by sending your first message.
          </p>

        </div>
      </div>
    );
  }

  const rendered: ReactNode[] = [];

  let prevSenderId = "";

  messages.forEach((msg, i) => {
    const isMe = msg.sender_id === currentUserId;

    const showDateDivider =
      i === 0 ||
      !isSameDay(msg.created_at, messages[i - 1].created_at);

    const isGrouped =
      msg.sender_id === prevSenderId && !showDateDivider;

    const isLast =
      i === messages.length - 1 ||
      messages[i + 1].sender_id !== msg.sender_id;

    if (showDateDivider) {
      rendered.push(
        <div
          key={`date-${msg.id}`}
          className="flex items-center gap-3 px-4 py-5"
        >
          <div className="flex-1 h-px bg-zinc-200" />

          <span className="px-3 py-1 rounded-full bg-white border border-zinc-200 text-[11px] font-medium text-zinc-500 shadow-sm">
            {formatDateLabel(msg.created_at)}
          </span>

          <div className="flex-1 h-px bg-zinc-200" />
        </div>
      );
    }

    rendered.push(
      <div
        key={msg.id}
        className={`flex px-3 md:px-5 ${
          isGrouped ? "mt-1" : "mt-4"
        } ${isMe ? "justify-end" : "justify-start"}`}
      >

        <div
          className={`flex flex-col max-w-[85%] md:max-w-[72%] ${
            isMe ? "items-end" : "items-start"
          }`}
        >

          <div
            className={`relative px-4 py-3 text-[15px] leading-relaxed wrap-break-words shadow-sm ${
              isMe
                ? `bg-linear-to-br from-violet-600 to-purple-600 text-white ${
                    isLast
                      ? "rounded-[22px] rounded-br-md"
                      : "rounded-[22px]"
                  }`
                : `bg-white border border-zinc-200 text-zinc-900 ${
                    isLast
                      ? "rounded-[22px] rounded-bl-md"
                      : "rounded-[22px]"
                  }`
            }`}
          >
            {msg.message}
          </div>

          {isLast && (
  <div
    className={`mt-1.5 px-1 text-[11px] font-medium tracking-tight text-zinc-400/80 ${
      isMe ? "text-right" : "text-left"
    }`}
  >
    <span className="inline-flex items-center gap-1 leading-none">

      <span>{formatTime(msg.created_at)}</span>

      {isMe && (
        <span className="inline-flex items-center ml-1">

          {msg.status === "sent" && (
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-zinc-400 opacity-90"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12.5L10 17L19 7"
              />
            </svg>
          )}

          {msg.status === "delivered" && (
            <div className="relative flex items-center w-5 h-4">

              <svg
                viewBox="0 0 24 24"
                className="absolute left-0 w-4 h-4 text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12.5L10 17L19 7"
                />
              </svg>

              <svg
                viewBox="0 0 24 24"
                className="absolute left-1.5 w-4 h-4 text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12.5L10 17L19 7"
                />
              </svg>

            </div>
          )}

          {msg.status === "seen" && (
            <div className="relative flex items-center w-5 h-4">

              <svg
                viewBox="0 0 24 24"
                className="absolute left-0 w-4 h-4 text-sky-500 transition-all duration-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12.5L10 17L19 7"
                />
              </svg>

              <svg
                viewBox="0 0 24 24"
                className="absolute left-1.5 w-4 h-4 text-sky-500 transition-all duration-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12.5L10 17L19 7"
                />
              </svg>

            </div>
          )}

        </span>
      )}

    </span>
  </div>
)}

        </div>

      </div>
    );

    prevSenderId = msg.sender_id;
  });

  return (
    <div className="flex flex-col min-h-full bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.05),transparent_30%)]">

      <div className="flex flex-col py-2">
        {rendered}
      </div>

      <div ref={bottomRef} className="h-5 shrink-0" />

    </div>
  );
}