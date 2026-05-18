"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SidebarSkeleton from "@/components/skeletons/SidebarSkeleton";

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-violet-600",
];

const getAvatarColor = (id: string) =>
  avatarColors[id?.charCodeAt(0) % avatarColors.length || 0];

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

export default function Sidebar({ onSelectConversation, selectedConversationId, onOpenNewChat, newConversation }: any) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [onlineMap, setOnlineMap] = useState<any>({});
  const [search, setSearch] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadMap, setUnreadMap] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "online">("all");

  const loadConversations = async () => {
  setIsLoading(true);

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id ?? null;
  setCurrentUserId(userId);

  if (!userId) {
    setConversations([]);
    setUnreadMap({});
    setIsLoading(false);
    return;
  }

  const { data: conversationsData } = await supabase
    .from("conversations")
    .select("id,user1_id,user2_id,last_message,updated_at")
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  const conversationIds = (conversationsData || []).map((c: any) => c.id);

  const { data: lastMessages } = await supabase
    .from("messages")
    .select("conversation_id, message, created_at")
    .in("conversation_id", conversationIds.length > 0 ? conversationIds : [""])
    .order("created_at", { ascending: false });

  const lastMessageMap: any = {};
  (lastMessages || []).forEach((msg: any) => {
    if (!lastMessageMap[msg.conversation_id]) {
      lastMessageMap[msg.conversation_id] = msg.message;
    }
  });

  const partnerIds = (conversationsData || [])
    .map((conv: any) => (conv.user1_id === userId ? conv.user2_id : conv.user1_id))
    .filter(Boolean);

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", partnerIds.length > 0 ? partnerIds : [""]);

  const profileMap = Object.fromEntries(
    (profileData || []).map((profile: any) => [profile.id, profile])
  );

  const formattedConversations = (conversationsData || []).map((conversation: any) => {
    const partnerId = conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;
    return {
      ...conversation,
      last_message: lastMessageMap[conversation.id] || conversation.last_message,
      partner: profileMap[partnerId] || { id: partnerId, full_name: "Unknown" },
    };
  });

  const { data: unreadMessages } = await supabase
    .from("messages")
    .select("conversation_id")
    .eq("receiver_id", userId)
    .eq("is_read", false);

  const unreadCountByConversation: any = {};
  (unreadMessages || []).forEach((message: any) => {
    unreadCountByConversation[message.conversation_id] =
      (unreadCountByConversation[message.conversation_id] || 0) + 1;
  });

  setConversations(formattedConversations);
  setUnreadMap(unreadCountByConversation);
  setIsLoading(false);
};

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      setActiveConversationId(selectedConversationId);
      setUnreadMap((prev: any) => ({ ...prev, [selectedConversationId]: 0 }));
    }
  }, [selectedConversationId]);

  useEffect(() => {
    if (!newConversation) return;

    setConversations((prev: any[]) => {
      const exists = prev.some((item) => item.id === newConversation.id);
      const updated = exists
        ? prev.map((item) => (item.id === newConversation.id ? newConversation : item))
        : [newConversation, ...prev];

      return updated.sort(
        (a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      );
    });
  }, [newConversation]);

  useEffect(() => {
    const presenceChannel = supabase.channel("online-users");
    const messageChannel = supabase
      .channel("realtime-messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const msg: any = payload.new;

          if (!currentUserId) return;

          if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
  // Only increment unread for receiver
  if (msg.receiver_id === currentUserId && msg.conversation_id !== activeConversationId) {
    setUnreadMap((prev: any) => ({
      ...prev,
      [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1,
    }));
  }

  setConversations((prev: any[]) => {
    const updated = prev.map((conversation) =>
      conversation.id === msg.conversation_id
        ? {
            ...conversation,
            last_message: msg.message,
            updated_at: msg.created_at,
          }
        : conversation
    );

    return updated.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });
}
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg: any = payload.new;

          if (!currentUserId || msg.receiver_id !== currentUserId) return;

          if (msg.is_read === true) {
            setUnreadMap((prev: any) => ({
              ...prev,
              [msg.conversation_id]:
                msg.conversation_id === activeConversationId
                  ? 0
                  : Math.max((prev[msg.conversation_id] || 1) - 1, 0),
            }));
          }
        }
      )
      .subscribe();

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const onlineUsers: any = {};

        Object.keys(state).forEach((key) => {
          state[key].forEach((p: any) => {
            onlineUsers[p.user_id] = true;
          });
        });

        setOnlineMap(onlineUsers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          const { data } = await supabase.auth.getUser();

          if (data.user) {
            await presenceChannel.track({
              user_id: data.user.id,
              online_at: new Date().toISOString(),
            });
          }
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(messageChannel);
    };
  }, [currentUserId, activeConversationId]);

  const openConversation = (conversation: any) => {
    setActiveConversationId(conversation.id);
    setUnreadMap((prev: any) => ({ ...prev, [conversation.id]: 0 }));
    onSelectConversation(conversation);
  };

  const baseFiltered = conversations.filter((conversation) =>
  conversation.partner.full_name?.toLowerCase().includes(search.toLowerCase())
);

const filteredConversations = baseFiltered.filter((conversation) => {
  const unread = unreadMap[conversation.id] || 0;
  const isOnline = !!onlineMap[conversation.partner.id];

  if (filter === "unread") return unread > 0;
  if (filter === "online") return isOnline;
  return true;
});
  const showEmptyState = !isLoading && filteredConversations.length === 0;

  return (
    <div className="h-full flex flex-col select-none border-r backdrop-blur-xl px-3  bg-[#fbfaff]"
      style={{
  background:
    "linear-gradient(180deg, #fcfbff 0%, #f7f4ff 100%)",
  borderColor: "rgba(139,92,246,0.08)",
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
}}
    >
      <div className="sticky top-0 z-20 pt-4 pb-3 space-y-3"
        style={{
          background: "linear-gradient(180deg, rgba(253,252,255,0.99) 80%, transparent 100%)",
        }}
      >
        <div className="flex items-center justify-between ml-2 mb-2">
          <p className="text-[10px] font-bold tracking-[0.16em] uppercase leading-none"
            style={{ color: "#7c3aed" }}
          >
            Conversations
          </p>
        <button
  type="button"
  onClick={onOpenNewChat}
  className="group relative flex items-center gap-2 text-[11px] font-semibold px-3 py-2 rounded-xl cursor-pointer
             transition-all duration-200
             hover:-translate-y-px
             hover:shadow-lg hover:shadow-violet-200"
  style={{
    background:
      "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(167,139,250,0.12))",
    color: "#5b21b6",
    border: "1px solid rgba(139,92,246,0.18)",
  }}
>
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
  </svg>

  <span>New Chat</span>

  <span
    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
    style={{
      background:
        "radial-gradient(circle at center, rgba(167,139,250,0.25), transparent 70%)",
    }}
  />
</button>
        </div>

        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <svg
              className="w-3.5 h-3.5 transition-colors duration-150"
              style={{ color: "#b8acd6" }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-full h-11 pl-10 pr-9 text-sm outline-none transition-all duration-200 placeholder:font-normal"
            style={{
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(139,92,246,0.12)",
              borderRadius: "18px",
              color: "#2e1065",
              fontFamily: "inherit",
              boxShadow:
  "0 4px 14px rgba(109,40,217,0.06)",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.40)";
              (e.target as HTMLInputElement).style.boxShadow =
                "0 0 0 4px rgba(139,92,246,0.08), 0 2px 8px rgba(109,40,217,0.06)";
              (e.target as HTMLInputElement).style.background = "#ffffff";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "rgba(139,92,246,0.12)";
              (e.target as HTMLInputElement).style.boxShadow = "0 2px 8px rgba(109,40,217,0.05)";
              (e.target as HTMLInputElement).style.background = "rgba(255,255,255,0.85)";
            }}
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150"
              style={{ background: "rgba(139,92,246,0.10)", color: "#7c3aed" }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

{/* Filters */}
<div className="px-0.5 pb-3 space-y-4">

  {/* Filter Bar */}
  <div
    className="relative flex items-center gap-1.5 p-1.5 rounded-2xl overflow-hidden"
    style={{
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(18px)",
      border: "1px solid rgba(139,92,246,0.10)",
      boxShadow:
        "0 6px 20px rgba(109,40,217,0.05)",
    }}
  >
    {(
      [
        {
          key: "all",
          label: "All",
          icon: (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h10"
              />
            </svg>
          ),
        },
        {
          key: "unread",
          label: "Unread",
          icon: (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 8h10M7 12h6m-8 8 14-14"
              />
            </svg>
          ),
        },
        {
          key: "online",
          label: "Online",
          icon: (
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          ),
        },
      ] as const
    ).map((item) => {
      const active = filter === item.key;

      return (
   <button
  key={item.key}
  onClick={() => setFilter(item.key)}
  className="relative flex-1 h-11 rounded-xl flex items-center justify-center gap-2
             text-[12px] font-semibold  cursor-pointer transition-all duration-300 ease-out"
  style={{
    background: active
      ? "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(167,139,250,0.16) 100%)"
      : "rgba(255,255,255,0.45)",

    color: active ? "#5b21b6" : "#6b5a99",

    border: active
      ? "1px solid rgba(139,92,246,0.16)"
      : "1px solid rgba(139,92,246,0.06)",

    boxShadow: active
      ? "0 4px 14px rgba(124,58,237,0.10)"
      : "0 1px 2px rgba(15,23,42,0.03)",

    backdropFilter: "blur(10px)",
  }}
  onMouseEnter={(e) => {
    if (!active) {
      e.currentTarget.style.background =
        "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(167,139,250,0.10))";

      e.currentTarget.style.borderColor =
        "rgba(139,92,246,0.12)";

      e.currentTarget.style.transform =
        "translateY(-1px)";
    }
  }}
  onMouseLeave={(e) => {
    if (!active) {
      e.currentTarget.style.background =
        "rgba(255,255,255,0.45)";

      e.currentTarget.style.borderColor =
        "rgba(139,92,246,0.06)";

      e.currentTarget.style.transform =
        "translateY(0px)";
    }
  }}
>
          <span
            className="flex items-center justify-center"
            style={{
              opacity: active ? 1 : 0.82,
            }}
          >
            {item.icon}
          </span>

          <span>{item.label}</span>

          {active && (
            <span
              className="absolute inset-0 rounded-xl"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.12), transparent)",
              }}
            />
          )}
        </button>
      );
    })}
  </div>

  {/* Section Header */}
  <div className="flex items-center justify-between px-1">
    <div>
      <p
        className="text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ color: "#7c3aed" }}
      >
        Chats
      </p>

      {/* <p
        className="text-[11px] mt-1"
        style={{ color: "#a1a1aa" }}
      >
        Conversations and activity
      </p> */}
    </div>

    {/* <div
      className="min-w-8 h-8 px-2 rounded-xl flex items-center justify-center
                 text-[11px] font-bold"
      style={{
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.10), rgba(167,139,250,0.16))",
        color: "#6d28d9",
        border: "1px solid rgba(139,92,246,0.10)",
        boxShadow:
          "0 4px 12px rgba(124,58,237,0.08)",
      }}
    >
      {filteredConversations.length}
    </div> */}
  </div>
</div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-violet-200">
        {isLoading ? (
          <SidebarSkeleton />
        ) : showEmptyState ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(167,139,250,0.12) 100%)",
                border: "1px solid rgba(139,92,246,0.12)",
              }}
            >
              <svg
                className="w-7 h-7"
                style={{ color: "#c4b5fd" }}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-bold" style={{ color: "#2e1065" }}>
  {conversations.length === 0 ? "No conversations yet" : "No results found"}
</h3>

<p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#b8acd6" }}>
  {conversations.length === 0
    ? "Start messaging from the New Chat button"
    : "Try searching with a different name."}
</p>
          </div>
        ) : (
     <div className="space-y-1 px-0.5">
            {filteredConversations.map((conversation) => {
              const isOnline = onlineMap[conversation.partner.id];
              const isActive = activeConversationId === conversation.id;
              const unreadCount = unreadMap[conversation.id] || 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => openConversation(conversation)}
                  className="w-full cursor-pointer group relative flex items-center gap-3 px-2.5 py-2.5 transition-all duration-200"
                  style={{
                    borderRadius: "16px",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(167,139,250,0.10) 100%)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(139,92,246,0.18)"
                      : "1px solid transparent",
                    boxShadow: isActive ? "0 4px 16px rgba(109,40,217,0.08)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.06)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.08)";
                      (e.currentTarget as HTMLButtonElement).style.transform =
  "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.transform =
  "translateY(0px)";
                    }
                  }}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold text-white`}
                      style={{
                        background: `linear-gradient(135deg, #7c3aed, #a78bfa)`,
                        boxShadow: isActive
                          ? "0 4px 12px rgba(124,58,237,0.30)"
                          : "0 2px 8px rgba(124,58,237,0.15)",
                      }}
                    >
                      {getInitials(conversation.partner.full_name)}
                    </div>
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                      style={{ background: isOnline ? "#34d399" : "#d1d5db" }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <h3
                      className="text-sm truncate"
                      style={{
                        color: isActive ? "#5b21b6" : "#1e0a3c",
                        fontWeight: isActive ? 700 : 600,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {conversation.partner.full_name}
                    </h3>
         <p
  className="text-[12.5px] mt-0.5 truncate leading-relaxed"
  style={{
    color: unreadCount > 0 ? "#374151" : "#9ca3af",
    fontWeight: unreadCount > 0 ? 500 : 400,
  }}
>
  {conversation.last_message || "Start a conversation"}
</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10.5px] font-semibold" style={{ color: "#b8acd6" }}>
                      {conversation.updated_at
                        ? new Date(conversation.updated_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "--:--"}
                    </span>
                    {unreadCount > 0 && (
                      <div
                        className="min-w-5 h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-white rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                          boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
                        }}
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <div
                      className="w-1.5 h-6 rounded-full shrink-0"
                      style={{ background: "linear-gradient(180deg, #7c3aed, #a78bfa)" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

