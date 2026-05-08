"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MessageInput({
  conversationId,
  senderId,
  onMessageSent,
}: any) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || !conversationId) return;

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
    }
  };

  return (
    <div className="p-4 bg-white flex gap-2 items-center">
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        placeholder="Type message..."
        className="flex-1 px-4 py-2 rounded-full bg-gray-100 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
      />

      <button
        onClick={handleSend}
        disabled={loading || !message.trim()}
        className="bg-orange-500 text-white px-5 py-2 rounded-full hover:bg-orange-600"
      >
        {loading ? "Sending..." : "Send"}
      </button>
    </div>
  );
}