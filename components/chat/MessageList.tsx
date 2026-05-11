"use client"

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function MessageList({ conversationId }: any) {
  const [messages, setMessages] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (data.user) {
        setCurrentUserId(data.user.id)
      }
    }

    getUser()
  }, [])

  const fetchMessages = async () => {
    if (!conversationId) return

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })

    setMessages(data || [])
  }

  useEffect(() => {
    fetchMessages()
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return

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
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto bg-linear-to-b from-orange-50 to-white px-4 py-6">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
            💬
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-700">
            No messages yet
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Start your first conversation
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const isCurrentUser = msg.sender_id === currentUserId

            return (
              <div
                key={msg.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-sm wrap-break-words ${
                    isCurrentUser
                      ? "bg-orange-500 text-white rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                  }`}
                >
                  <p>{msg.message}</p>

                  <p
                    className={`text-[11px] mt-1 text-right ${
                      isCurrentUser
                        ? "text-orange-100"
                        : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}