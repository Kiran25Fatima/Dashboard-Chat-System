"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EmojiPicker from "emoji-picker-react";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";

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
  const [file, setFile] = useState<File | null>(null);

  
  const closeEmoji = () => setShowEmoji(false);
  const {
  isRecording,
  audioBlob,
  duration,
  startRecording,
  stopRecording,
  resetRecording,
} = useVoiceRecorder();

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

  const uploadVoiceNote = async () => {
  if (!audioBlob) return null;

  const filePath = `${conversationId}/${Date.now()}.webm`;

  const { error } = await supabase.storage
    .from("voice-notes")
    .upload(filePath, audioBlob, {
      contentType: "audio/webm",
    });

  if (error) {
    console.error(error);
    return null;
  }

  const { data } = supabase.storage
    .from("voice-notes")
    .getPublicUrl(filePath);

  return data.publicUrl;
};

  const handleSend = async () => {
    const text = message.trim();

    if (loading) return;
   if (!text && !file && !audioBlob) return;
    if (!conversationId) {
      console.error("❌ Cannot send message: missing conversationId");
      return;
    }

    setLoading(true);
    let fileUrl = null;
let voiceUrl = null;

if (audioBlob) {
  voiceUrl = await uploadVoiceNote();
}
if (file) {
  const filePath = `${conversationId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("chat-files")
    .upload(filePath, file);

  if (!error) {
    const { data } = supabase.storage
      .from("chat-files")
      .getPublicUrl(filePath);

    fileUrl = data.publicUrl;
  }
}
const isImage = file?.type?.startsWith("image/");
const isAudio =
  file?.type?.startsWith("audio/") ||
  file?.name?.includes("voice") ||
  file?.name?.includes(".webm") ||
  file?.name?.includes(".mp3") ||
  file?.name?.includes(".ogg");

    const { data: insertedMessage, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
     message: text || null,
        status: "sent",
        is_read: false,
        file_url: fileUrl,
file_name: file?.name || null,
file_type: file?.type || null,
voice_url: voiceUrl || null,
  voice_duration: audioBlob ? duration : null,


      })
      .select("id, conversation_id, created_at")
.single();

    if (insertError) {
      console.error("❌ Failed to insert message:", insertError.message);
      setLoading(false);
      return;
    }

    if (!insertedMessage || insertedMessage.conversation_id !== conversationId) {
      console.error(
        "❌ Inserted message did not return expected conversation_id:",
        insertedMessage
      );
    }

  try {
  const { error: updateError } = await supabase
    .from("conversations")
    .update({
     last_message: audioBlob
  ? "🎙 Voice message"
  : file
  ? file.type.startsWith("image/")
    ? "🖼 Photo"
    : "📄 File"
  : text || "",
       updated_at: insertedMessage.created_at,
    })
    .eq("id", conversationId);

  if (updateError) {
    console.error("❌ Update failed:", updateError.message);
  } else {
    console.log("✅ Conversation updated successfully");
  }
} catch (updateException) {
  console.error("❌ Unexpected error updating conversation:", updateException);
}

    setMessage("");
    setFile(null);
    resetRecording();
    onMessageSent?.();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    onTyping?.(false);
    isTypingRef.current = false;

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setLoading(false);
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
  (!!message.trim() || !!file || !!audioBlob) &&
  !!conversationId &&
  !loading;

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

        {/* File preview bar */}
        {file && (
          <div
            className="flex items-center gap-2 px-3 py-2 mx-2 mt-2"
            style={{
              borderRadius: "12px",
              background: "rgba(139,92,246,0.07)",
              border: "1px solid rgba(139,92,246,0.15)",
            }}
          >
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
              background: "rgba(139,92,246,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden",
            }}>
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  style={{ width: "32px", height: "32px", objectFit: "cover" }}
                />
              ) : (
                <svg width="16" height="16" fill="none" stroke="#7c3aed" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              )}
            </div>

            <div style={{ flex: 1, overflow: "hidden" }}>
              <p style={{
                margin: 0, fontSize: "13px", fontWeight: 500, color: "#1e0a3c",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {file.name}
              </p>
              <p style={{ margin: 0, fontSize: "11px", color: "rgba(109,40,217,0.55)" }}>
                {file.type.startsWith("image/") ? "Image" :
                 file.type === "application/pdf" ? "PDF" :
                 file.type?.includes("word") ? "Word doc" : "File"} · {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>

            <button
              onClick={() => setFile(null)}
              style={{
                background: "rgba(139,92,246,0.1)", border: "none", cursor: "pointer",
                width: "24px", height: "24px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}
            >
              <svg width="12" height="12" fill="none" stroke="#7c3aed" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 px-2 py-2 md:gap-1.5">
          <button
            onClick={() => setShowEmoji((p) => !p)}
            className="flex w-10 h-10 sm:w-9 sm:h-9 items-center justify-center rounded-xl cursor-pointer transition-all duration-150"
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
{audioBlob && (
  <div
    className="flex items-center gap-3 px-3 py-2 mx-2 mt-2"
    style={{
      borderRadius: "12px",
      background: "rgba(139,92,246,0.07)",
    }}
  >
    <audio
      controls
      src={URL.createObjectURL(audioBlob)}
      className="max-w-55"
    />

    <button onClick={resetRecording}>
      ❌
    </button>
  </div>
)}
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
            
              className=" sm:flex w-9 h-9 items-center justify-center rounded-xl cursor-pointer transition-all duration-150"
              style={{ color: "#b8acd6" }}
              
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "#7c3aed";
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.06)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = "#b8acd6";
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              }}
               onClick={(e) => {
    const input = e.currentTarget.querySelector("input") as HTMLInputElement;
    input?.click();
  }}
            >
              <input
    type="file"
    accept="image/*,.pdf,.doc,.docx"
    hidden
    onChange={(e) => {
      if (e.target.files?.[0]) {
        setFile(e.target.files[0]);
      }
    }}
  />
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
              </svg>
            </button>
<button
  type="button"
  onMouseDown={startRecording}
  onMouseUp={stopRecording}
  onTouchStart={startRecording}
  onTouchEnd={stopRecording}
  className="w-10 h-10 rounded-xl flex items-center justify-center"
  style={{
    background: isRecording
      ? "#dc2626"
      : "rgba(139,92,246,0.08)",
    color: isRecording ? "#fff" : "#7c3aed",
  }}
>
  🎤
</button>
            
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150"
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
                <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
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