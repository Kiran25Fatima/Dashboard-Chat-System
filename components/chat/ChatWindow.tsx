"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

export default function ChatWindow({ selectedUser }: any) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    };

    getUser();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selectedUser || !user) return

      setLoading(true)
      setConversationId(null)

      const { data: existing } = await supabase
        .from("conversations")
        .select("*")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${selectedUser.id}),and(user1_id.eq.${selectedUser.id},user2_id.eq.${user.id})`
        )
        .maybeSingle()

      if (existing) {
        setConversationId(existing.id)
        setLoading(false);
        return;
      }

      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          user1_id: user.id,
          user2_id: selectedUser.id,
        })
        .select()
        .single();

      if (error) {
        setLoading(false)
        return
      }

      setConversationId(created.id)
      setLoading(false);
    };

    run();
  }, [selectedUser, user])

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 bg-white text-gray-800 font-semibold">
        {selectedUser ? selectedUser.full_name : "Select a user"}
      </div>

      <MessageList conversationId={conversationId} />

      {selectedUser && user && (
        <MessageInput
          conversationId={conversationId}
          senderId={user.id}
          onMessageSent={() => {}}
        />
      )}

      {loading && (
        <div className="p-2 text-sm text-gray-400">Loading chat...</div>
      )}
    </div>
  )
}