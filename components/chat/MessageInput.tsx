"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MessageInput({ conversationId, senderId, onMessageSent }: any) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || !conversationId || loading) return;
    setLoading(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message: message.trim(),
    });

    setLoading(false);

    if (!error) {
      setMessage("");
      onMessageSent?.();
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    }
  };

  const canSend = message.trim().length > 0 && !!conversationId && !loading;

  return (
    <div className="px-4 py-3 border-t border-zinc-200 bg-white/80 backdrop-blur">
      <div
        className={`flex items-end gap-2.5 rounded-2xl border transition-all duration-200 bg-zinc-100 ${
          message
            ? "border-zinc-300"
            : "border-zinc-200"
        } px-3 py-2.5`}
      >
        <button className="w-7 h-7 shrink-0 mb-0.5 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-200">
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
              d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
            />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Write a message… (Enter to send)"
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm text-zinc-900 placeholder-zinc-500 resize-none leading-relaxed py-0.5 max-h-36 overflow-y-auto"
          style={{ height: "auto", minHeight: "22px" }}
        />

        <button className="w-7 h-7 shrink-0 mb-0.5 flex items-center justify-center text-zinc-500 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-200">
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
              d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
            />
          </svg>
        </button>

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`w-8 h-8 shrink-0 mb-0.5 flex items-center justify-center rounded-xl transition-all duration-200 ${
            canSend
              ? "bg-violet-600 hover:bg-violet-500 active:scale-95 shadow-lg shadow-violet-900/30 text-white"
              : "bg-zinc-200 text-zinc-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
          ) : (
            <svg
              className="w-4 h-4 translate-x-px"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          )}
        </button>
      </div>

      <p className="text-[10px] text-zinc-500 text-center mt-2">
        Shift + Enter for new line · Enter to send
      </p>
    </div>
  );
}