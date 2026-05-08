"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function MessageList({ conversationId }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState("")

  const bottomRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setCurrentUserId(data.user.id)
    };

    getUser();
  }, []);

 
  const fetchMessages = async () => {
    if (!conversationId) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    setMessages(data || []);
  };

  useEffect(() => {
    fetchMessages()
  }, [conversationId])

 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">

      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400 text-sm">
            Start the conversation 👋
          </p>
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={`px-3 py-2 rounded-lg max-w-xs wrap-break-words text-sm shadow-sm ${
              msg.sender_id === currentUserId
                ? "ml-auto bg-orange-500 text-white"
                : "mr-auto bg-white border border-gray-200 text-gray-800"
            }`}
          >
            {msg.message}
          </div>
        ))
      )}

    
      <div ref={bottomRef} />
    </div>
  );
}