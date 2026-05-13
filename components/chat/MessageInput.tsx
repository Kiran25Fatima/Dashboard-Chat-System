"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({
  conversationId,
  senderId,
  onMessageSent,
}: any) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  const closeEmoji = () => setShowEmoji(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      closeEmoji();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    closeEmoji();

    const el = textareaRef.current;

    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    }
  };

  const canSend =
    message.trim().length > 0 && !!conversationId && !loading;

  return (
    <div className="px-2 md:px-4 py-3 bg-white border-t border-zinc-200">
      <div className="relative rounded-[28px] border border-zinc-200 bg-white shadow-sm focus-within:border-violet-300 focus-within:shadow-[0_0_0_4px_rgba(139,92,246,0.08)]">

        {showEmoji && (
          <div ref={emojiRef} className="absolute bottom-16 left-3 z-50">
            <EmojiPicker
              onEmojiClick={(emoji: any) => {
                setMessage((prev) => prev + emoji.emoji);
              }}
            />
          </div>
        )}

        <div className="flex items-end gap-2 px-3 py-2.5">
          <button
            onClick={() => setShowEmoji((p) => !p)}
            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-2xl text-zinc-500 hover:bg-zinc-100 hover:text-violet-600 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.9}
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
            rows={1}
            placeholder="Type your message..."
            className="flex-1 resize-none bg-transparent outline-none text-[15px] text-zinc-900 placeholder:text-zinc-400 leading-relaxed max-h-36 overflow-y-auto py-2"
            style={{ minHeight: "24px" }}
          />

          <div className="flex items-center gap-1 shrink-0">
            <button className="hidden sm:flex w-10 h-10 items-center justify-center rounded-2xl text-zinc-500 hover:bg-zinc-100 hover:text-violet-600 transition">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.9}
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
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition ${
                canSend
                  ? "bg-linear-to-br from-violet-600 to-purple-600 text-white hover:scale-[1.03] active:scale-95"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4.5 h-4.5 -rotate-12 translate-x-px"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.3}
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
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <p className="text-[11px] text-zinc-400">
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}