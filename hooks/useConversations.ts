
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function useConversations({ user, loading, selectedConversationId, newConversation, onSelectConversation }: any) {
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

    const userId = user?.id ?? null;
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
    // wait until useCurrentUser has finished loading
    if (loading) return;
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user]);

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
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, async (payload) => {
        const msg: any = payload.new;
        if (!currentUserId) return;
        if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
          if (msg.receiver_id === currentUserId && msg.conversation_id !== activeConversationId) {
            setUnreadMap((prev: any) => ({
              ...prev,
              [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1,
            }));
          }
          setConversations((prev: any[]) => {
            const updated = prev.map((conversation) =>
              conversation.id === msg.conversation_id
                ? { ...conversation, last_message: msg.message, updated_at: msg.created_at }
                : conversation
            );
            return updated.sort(
              (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );
          });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
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
      })
      .subscribe();

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const onlineUsers: any = {};
        Object.keys(state).forEach((key) => {
          state[key].forEach((p: any) => { onlineUsers[p.user_id] = true; });
        });
        setOnlineMap(onlineUsers);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED" && user) {
          await presenceChannel.track({ user_id: user.id, online_at: new Date().toISOString() });
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

  // only show empty state when user is confirmed loaded and fetch is done
  const showEmptyState = !loading && !isLoading && filteredConversations.length === 0;

  return {
    conversations,
    filteredConversations,
    onlineMap,
    unreadMap,
    isLoading,
    showEmptyState,
    openConversation,
    search,
    setSearch,
    filter,
    setFilter,
  };
}
