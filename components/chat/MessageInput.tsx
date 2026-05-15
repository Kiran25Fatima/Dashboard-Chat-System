"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EmojiPicker from "emoji-picker-react";

export default function MessageInput({
  conversationId,
  senderId,
  receiverId,
  onMessageSent,
  onTyping, // ✅ Received from ChatWindow — calls track() on the shared channel
}: any) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  
  const closeEmoji = () => setShowEmoji(false);

  // ✅ Now delegates to the shared channel in ChatWindow via onTyping prop
  const broadcastTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!isTypingRef.current) {
      onTyping?.(true);
      isTypingRef.current = true;
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping?.(false);
      isTypingRef.current = false;
    }, 1500);
  };

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

  // ✅ Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = async () => {
    if (!message.trim() || !conversationId || loading) return;

    setLoading(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: message.trim(),
      status: "sent",
      is_read: false,
    });

    setLoading(false);

    if (!error) {
      setMessage("");
      onMessageSent?.();

    
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTyping?.(false);
      isTypingRef.current = false;

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
    broadcastTyping(); 

    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    }
  };

  const canSend =
    message.trim().length > 0 && !!conversationId && !loading;

  return (
    <div className="px-2 md:px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)]"
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
  
      <div
        className="relative transition-all duration-200"
        style={{
          borderRadius: "22px",
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(139,92,246,0.16)",
          boxShadow: "0 2px 12px rgba(109,40,217,0.07)",
        }}
        onFocusCapture={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(139,92,246,0.38)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0 4px rgba(139,92,246,0.07), 0 2px 16px rgba(109,40,217,0.10)";
        }}
        onBlurCapture={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(139,92,246,0.16)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(109,40,217,0.07)";
        }}
      >
        {/* Emoji picker */}
        {showEmoji && (
          <div ref={emojiRef} className="absolute bottom-16 left-0 sm:left-3 z-50 scale-[0.95] sm:scale-100 origin-bottom-left">
            <EmojiPicker
              onEmojiClick={(emoji: any) => {
                setMessage((prev) => prev + emoji.emoji);
              }}
            />
          </div>
        )}

        <div className="flex items-end gap-2 px-2 py-2 md:gap-1.5">
          <button
            onClick={() => setShowEmoji((p) => !p)}
            className="flex w-10 h-10 sm:w-9 sm:h-9 items-center justify-center rounded-xl transition-all duration-150"
            style={{
              color: showEmoji ? "#7c3aed" : "#b8acd6",
              background: showEmoji ? "rgba(139,92,246,0.08)" : "transparent",
            }}
            onMouseEnter={e => {
              if (!showEmoji) {
                (e.currentTarget as HTMLButtonElement).style.color = "#7c3aed";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.06)";
              }
            }}
            onMouseLeave={e => {
              if (!showEmoji) {
                (e.currentTarget as HTMLButtonElement).style.color = "#b8acd6";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Write a message…"
            className="flex-1 min-w-0 resize-none bg-transparent outline-none leading-relaxed max-h-32 sm:max-h-36 overflow-y-auto py-2 text-[15px]"
            style={{
              minHeight: "24px",
              fontSize: "14.5px",
              color: "#1e0a3c",
              fontFamily: "inherit",
            }}
          />

          {/* Attachment + send */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl transition-all duration-150"
              style={{ color: "#b8acd6" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "#7c3aed";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.06)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "#b8acd6";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            </button>

            
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-150"
              style={
                canSend
                  ? {
                      background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
                      color: "#ffffff",
                      boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
                      transform: "scale(1)",
                    }
                  : {
                      background: "rgba(139,92,246,0.07)",
                      color: "#c4b5fd",
                      cursor: "not-allowed",
                    }
              }
              onMouseEnter={e => {
                if (canSend) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 18px rgba(124,58,237,0.42)";
                }
              }}
              onMouseLeave={e => {
                if (canSend) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(124,58,237,0.35)";
                }
              }}
              onMouseDown={e => {
                if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
              }}
              onMouseUp={e => {
                if (canSend) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)";
              }}
            >
              {loading ? (
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "#ffffff" }}
                />
              ) : (
                <svg
                  className="w-4 h-4 -rotate-12 translate-x-px"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.3}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

    
      <div className="flex justify-center mt-2">
        <p
          className="text-[11px] font-medium tracking-wide"
          style={{ color: "#c4b5fd" }}
        >
          Enter to send · Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}