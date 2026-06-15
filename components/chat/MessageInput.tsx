"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import EmojiPicker from "emoji-picker-react";
import useVoiceRecorder from "@/hooks/useVoiceRecorder";
import VoiceNotePreview from "@/components/ui/VoiceNotePreview";
import { Smile, Paperclip, Mic, Square, X, SendHorizonal } from "lucide-react";

export default function MessageInput({
  conversationId,
  senderId,
  receiverId,
  groupId,
  onMessageSent,
  onTyping,
}: any) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
    abortRecording,
  } = useVoiceRecorder();

  const broadcastTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const uploadVoiceNote = async () => {
    if (!audioBlob) return null;
    const filePath = `${conversationId}/${Date.now()}.webm`;
    const { error } = await supabase.storage
      .from("voice-notes")
      .upload(filePath, audioBlob, { contentType: "audio/webm" });
    if (error) { console.error(error); return null; }
    const { data } = supabase.storage.from("voice-notes").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSend = async () => {
    const text = message.trim();
    if (loading || (!text && !file && !audioBlob)) return;
    if (!conversationId) return;

    setLoading(true);
    let fileUrl = null;
    let voiceUrl = null;

    if (audioBlob) voiceUrl = await uploadVoiceNote();

    if (file) {
      const filePath = `${conversationId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("chat-files").upload(filePath, file);
      if (!error) {
        const { data } = supabase.storage.from("chat-files").getPublicUrl(filePath);
        fileUrl = data.publicUrl;
      }
    }

   const { data: insertedMessage, error: insertError } = await supabase
  .from("messages")
  .insert({
    conversation_id: groupId ? null : conversationId,
    group_id: groupId || null,
    sender_id: senderId,
    receiver_id: groupId ? null : receiverId,
    message: text || null,
    status: "sent",
    is_read: false,
    file_url: audioBlob ? null : fileUrl,
    file_name: audioBlob ? null : file?.name || null,
    file_type: audioBlob ? null : file?.type || null,
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

   if (!groupId) {
  await supabase
    .from("conversations")
    .update({
      last_message: audioBlob
        ? "🎙 Voice message"
        : file
        ? file.type.startsWith("image/") ? "🖼 Photo" : "📄 File"
        : text || "",
      updated_at: insertedMessage.created_at,
    })
    .eq("id", conversationId);
}

    setMessage("");
    setFile(null);
    resetRecording();
    onMessageSent?.();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onTyping?.(false);
    isTypingRef.current = false;
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      setShowEmoji(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setShowEmoji(false);
    broadcastTyping();
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 140) + "px";
    }
  };

  const canSend = (!!message.trim() || !!file || !!audioBlob) && !!conversationId && !loading;

  return (
<div className="px-0.5 py-1 pb-[calc(env(safe-area-inset-bottom)+4px)]">
      {/* Emoji picker */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="absolute bottom-20 left-2 sm:left-4 z-50 origin-bottom-left scale-90 sm:scale-100"
        >
          <EmojiPicker
            onEmojiClick={(emoji: any) => setMessage((prev) => prev + emoji.emoji)}
          />
        </div>
      )}

      {/* Main input container */}
<div className="rounded-2xl border border-slate-200 bg-white focus-within:border-violet-500/45 focus-within:ring-4 focus-within:ring-violet-500/5 shadow-sm transition-all duration-200">
        {/* File preview */}
        {file && (
          <div className="flex items-center gap-2.5 px-3 pt-2.5 pb-1">
            <div className="w-8 h-8 rounded-lg bg-violet-50  border border-violet-100 flex items-center justify-center shrink-0 overflow-hidden">
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="14" height="14" fill="none" stroke="#7c3aed" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-slate-700  truncate">{file.name}</p>
              <p className="text-[11px] text-slate-400">
                {file.type.startsWith("image/") ? "Image" : file.type === "application/pdf" ? "PDF" : "File"}
                {" · "}{(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={() => setFile(null)}
              className="w-6 h-6 rounded-full bg-slate-100  flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Input row */}
        <div className="flex items-center gap-2 px-2 py-1.5">
<div className="flex items-center gap-1 shrink-0">

  {!audioBlob && !isRecording && (
    <>
      <button
        onClick={() => setShowEmoji((p) => !p)}
        className={`w-8 h-8 flex items-center  cursor-pointer justify-center rounded-full transition-colors shrink-0
          ${showEmoji
            ? "text-violet-600 bg-violet-50 "
            : "text-slate-400 hover:text-violet-500 hover:bg-slate-50 "
          }`}
      >
        <Smile size={18} />
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer text-slate-400 hover:text-violet-500 hover:bg-slate-50 "
      >
        <Paperclip size={17} />
      </button>
    </>
  )}

  <input
    ref={fileInputRef}
    type="file"
    accept="image/*,.pdf,.doc,.docx"
    hidden
    onChange={(e) => {
      if (e.target.files?.[0]) setFile(e.target.files[0]);
    }}
  />
</div>

          {/* Center: textarea / recording / preview */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            {isRecording ? (
               <div className="w-full flex items-center gap-3 px-2">
  <div className="flex items-center gap-2 shrink-0">
    <span className="relative flex h-2.5 w-2.5">
      <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 animate-ping" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
    </span>

    <span className="text-sm font-medium text-red-500 tabular-nums">
      {Math.floor(duration / 60)}:
      {String(duration % 60).padStart(2, "0")}
    </span>
  </div>

 <div className="flex-1 flex items-center gap-0.75 h-8 overflow-hidden">
  {Array.from({ length: 35 }).map((_, i) => (
    <div
      key={i}
      className="w-0.75 rounded-full bg-linear-to-t from-rose-300 to-rose-200"
      style={{
        height: `${8 + ((i * 11) % 20)}px`,
        animation: `recBar ${0.5 + (i % 4) * 0.12}s ease-in-out infinite`,
        animationDelay: `${i * 0.03}s`,
      }}
    />
  ))}
</div>
</div>
           ) : audioBlob ? (
 <div className="w-full max-w-105">
    <VoiceNotePreview
      audioBlob={audioBlob}
      duration={duration}
      onDiscard={resetRecording}
      onSend={handleSend}
    />
  </div>

            ) : (
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Write a message…"
               className="w-full resize-none bg-transparent outline-none text-[14.5px] leading-5 text-slate-800  placeholder:text-slate-400 max-h-32 overflow-y-auto "
                style={{ minHeight: "24px", fontFamily: "inherit" }}
              />
            )}
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Attach — hidden during recording/preview */}
            

            {/* Cancel recording */}
            {isRecording && (
              <button
                onClick={abortRecording}
                className="
                w-9 h-9
                rounded-full
                cursor-pointer
                border border-slate-200

                bg-white

                flex items-center justify-center
                text-slate-400
                hover:text-red-500
                hover:bg-red-50
                hover:border-red-200


                transition-all duration-200
                "
                aria-label="Cancel recording"
              >
               <X size={15} />
              </button>
            )}

            {/* Stop recording */}
            {isRecording && (
             <button
              onClick={stopRecording}
              className="
                w-9 h-9
                rounded-full
                cursor-pointer
                bg-violet-600
                hover:bg-violet-700
                active:scale-95
                text-white
                flex items-center justify-center
                shadow-sm
                transition-all duration-200
              "
              aria-label="Stop recording"
            >
              <Square size={12} fill="currentColor" />
            </button>
            )}

            {/* Mic — only when idle */}
            {!message.trim() && !file && !audioBlob && !isRecording && (
              <button
                onClick={startRecording}
                className="w-8 h-8 cursor-pointer rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-colors"
                aria-label="Record voice message"
              >
                <Mic size={15} />
              </button>
            )}

            {/* Send text/file */}
            {canSend && !audioBlob && !isRecording && (
              <button
                onClick={handleSend}
                disabled={!canSend}
                className="w-8 h-8 cursor-pointer rounded-full bg-violet-600 hover:bg-violet-700 active:scale-95 text-white flex items-center justify-center transition-all"
                aria-label="Send message"
              >
                {loading
                  ? <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  : <SendHorizonal size={14} />
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-[11px] font-medium tracking-wide text-slate-400/90 mt-2 hidden sm:block">
  Enter to send · Shift+Enter for new line
</p>
    </div>
  );
}