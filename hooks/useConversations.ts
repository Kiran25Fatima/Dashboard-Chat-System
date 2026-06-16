
"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import usePresence from "@/hooks/usePresence";

export default function useConversations({ user, loading, selectedConversationId, newConversation, onSelectConversation }: any) {
  const [conversations, setConversations] = useState<any[]>([]);
  const { onlineMap } = usePresence(user);
  const [search, setSearch] = useState("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [unreadMap, setUnreadMap] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "online">("all");
  const [groups, setGroups] = useState<any[]>([]);
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
.or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

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
  const partnerId =
    conversation.user1_id === userId ? conversation.user2_id : conversation.user1_id;

  const profile = profileMap[partnerId];

  const lastMsg = lastMessages?.find(
    (m: any) => m.conversation_id === conversation.id
  );

  return {
    ...conversation,

  
   updated_at: lastMsg?.created_at || conversation.updated_at || conversation.created_at,

    last_message: lastMsg?.message || conversation.last_message || "",

    partner: {
      id: partnerId,
      full_name: profile?.full_name || "Unknown",
    },
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
await supabase
  .from("messages")
  .update({ status: "delivered" })
  .eq("receiver_id", userId)
  .eq("status", "sent");
    setConversations(
  formattedConversations.sort(
    (a: any, b: any) =>
      new Date(b.updated_at || 0).getTime() -
      new Date(a.updated_at || 0).getTime()
  )
);
    setUnreadMap((prev: any) => ({ ...prev, ...unreadCountByConversation }));
    setIsLoading(false);
  };
const loadGroups = async () => {
  const userId = user?.id ?? null;
  if (!userId) return;

  const { data: memberRows } = await supabase
    .from("group_members")
    .select("group_id, last_read_at")
    .eq("user_id", userId);

  console.log("MEMBER ROWS:", memberRows); // 👈

  const groupIds = (memberRows || []).map((r: any) => r.group_id);
  if (groupIds.length === 0) {
    setGroups([]);
    return;
  }

  const lastReadMap: Record<string, string> = {};
  (memberRows || []).forEach((r: any) => {
    lastReadMap[r.group_id] = r.last_read_at;
  });

  console.log("LAST READ MAP:", lastReadMap); // 👈

  const { data: groupData } = await supabase
    .from("groups")
    .select("id, name, avatar_url, created_at")
    .in("id", groupIds);

  const { data: lastGroupMessages } = await supabase
    .from("messages")
    .select("group_id, message, created_at, sender_id, file_type")
    .in("group_id", groupIds)
    .order("created_at", { ascending: false });

  console.log("GROUP MESSAGES:", lastGroupMessages); // 👈

  const lastGroupMsgMap: any = {};
  (lastGroupMessages || []).forEach((msg: any) => {
    if (!lastGroupMsgMap[msg.group_id]) {
      lastGroupMsgMap[msg.group_id] = msg;
    }
  });

  const unreadGroupMap: Record<string, number> = {};
  (lastGroupMessages || []).forEach((msg: any) => {
    if (msg.sender_id === userId) return;
    const lastRead = lastReadMap[msg.group_id];
    if (!lastRead || new Date(msg.created_at) > new Date(lastRead)) {
      unreadGroupMap[msg.group_id] = (unreadGroupMap[msg.group_id] || 0) + 1;
    }
  });

  console.log("UNREAD GROUP MAP:", unreadGroupMap); // 👈

  const formatted = (groupData || []).map((group: any) => {
    const lastMsg = lastGroupMsgMap[group.id];
    return {
      ...group,
      isGroup: true,
      last_message: lastMsg?.message ||
        (lastMsg?.file_type?.startsWith("image/") ? "🖼️ Photo" : lastMsg ? "📎 Attachment" : ""),
      updated_at: lastMsg?.created_at || group.created_at,
    };
  });

  setGroups(
    formatted.sort(
      (a: any, b: any) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  );

  setUnreadMap((prev: any) => ({ ...prev, ...unreadGroupMap }));
};
 useEffect(() => {
  if (loading) return;
  const run = async () => {
    await loadConversations();
    await loadGroups(); // runs AFTER loadConversations finishes
  };
  run();
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
      return updated;
    });
  }, [newConversation]);


  useEffect(() => {
    const messageChannel = supabase
      .channel("realtime-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, async (payload) => {
        const msg: any = payload.new;
        if (!currentUserId) return;
        if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
          if (msg.receiver_id === currentUserId) {
  if (msg.conversation_id !== activeConversationId) {
    setUnreadMap((prev: any) => ({
      ...prev,
      [msg.conversation_id]: (prev[msg.conversation_id] || 0) + 1,
    }));
    supabase
      .from("messages")
      .update({ status: "delivered" })
      .eq("id", msg.id)
      .eq("status", "sent")
      .then(() => {});
  } else {
    // Chat is open — mark seen immediately
    supabase
      .from("messages")
      .update({ is_read: true, status: "seen", read_at: new Date().toISOString() })
      .eq("id", msg.id)
      .then(() => {});
  }
}
          setConversations((prev: any[]) => {
  const updated = prev.map((conversation) =>
    conversation.id === msg.conversation_id
      ? {
          ...conversation,
        last_message: msg.voice_url
  ? "🎙️ Voice message"
  : msg.message ||
    (msg.file_type?.startsWith("image/") ? "🖼️ Photo" :
     msg.file_name ? `📎 ${msg.file_name}` : "📎 Attachment"),
          updated_at: msg.created_at,
        }
      : conversation
  );

  return [...updated].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() -
      new Date(a.updated_at).getTime()
  );
});
        }
     if (msg.group_id) {
  setGroups((prev) => {
    // existing group last_message update
    const updated = prev.map((group) =>
      group.id === msg.group_id
        ? {
            ...group,
            last_message: msg.voice_url
  ? "🎙️ Voice message"
  : msg.message ||
    (msg.file_type?.startsWith("image/") ? "🖼️ Photo" :
     msg.file_name ? `📎 ${msg.file_name}` : "📎 Attachment"),
            updated_at: msg.created_at,
          }
        : group
    );
    return [...updated].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });

  // ✅ increment unread if not currently viewing this group
  if (msg.sender_id !== currentUserId && msg.group_id !== activeConversationId  &&
  msg.message_type !== "system" // ← skip system messages
  ) {
    setUnreadMap((prev : any) => ({
      ...prev,
      [msg.group_id]: (prev[msg.group_id] || 0) + 1,
    }));
  }
} 
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, (payload) => {
        const msg: any = payload.new;
        if (!currentUserId) return;
         if (msg.deleted_at && (msg.sender_id === currentUserId || msg.receiver_id === currentUserId)) {
    setConversations((prev: any[]) => {
      const updated = prev.map((conversation) =>
        conversation.id === msg.conversation_id
          ? {
              ...conversation,
              last_message: "This message was deleted",
            }
          : conversation
      );
      return [...updated].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
  }

  if (msg.deleted_at && msg.group_id) {
  setGroups((prev: any[]) => {
    const updated = prev.map((group) =>
      group.id === msg.group_id
        ? { ...group, last_message: "This message was deleted" }
        : group
    );
    return [...updated].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  });
}
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

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [currentUserId, activeConversationId]);

  


  useEffect(() => {
  if (!currentUserId) return;

  const groupMemberChannel = supabase
    .channel("group-membership-changes")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "group_members",
        filter: `user_id=eq.${currentUserId}`,
      },
      async (payload) => {
        const groupId = payload.new.group_id;

        // fetch the new group's details
        const { data: group } = await supabase
          .from("groups")
          .select("id, name, avatar_url, created_at")
          .eq("id", groupId)
          .single();

        if (group) {
          setGroups((prev) => {
            // avoid duplicate if creator already added it
            if (prev.some((g) => g.id === group.id)) return prev;
            return [
              {
                ...group,
                isGroup: true,
                last_message: "",
                updated_at: group.created_at,
              },
              ...prev,
            ];
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(groupMemberChannel);
  };
}, [currentUserId]);

useEffect(() => {
  if (!currentUserId) return;

  const groupsChannel = supabase
    .channel("group-updates")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "groups" },
      (payload) => {
        const updated = payload.new;
        setGroups((prev) =>
          prev.map((g) =>
            g.id === updated.id
              ? { ...g, name: updated.name, avatar_url: updated.avatar_url }
              : g
          )
        );
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(groupsChannel); };
}, [currentUserId]);
  

  const openConversation = (conversation: any) => {
    setActiveConversationId(conversation.id);
    setUnreadMap((prev: any) => ({ ...prev, [conversation.id]: 0 }));
    onSelectConversation(conversation);

    if (conversation.isGroup && currentUserId) {
    supabase
      .from("group_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("group_id", conversation.id)
      .eq("user_id", currentUserId)
      .then(() => {});
  }
  };

const leaveGroup = async (groupId: string) => {
  if (!currentUserId) return;

  // 1. get all current members
  const { data: allMembers } = await supabase
    .from("group_members")
    .select("user_id, role")
    .eq("group_id", groupId);

  if (!allMembers) return;

  // 2. get current user's name for system message
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", currentUserId)
    .single();

  const userName = profile?.full_name || "Someone";

  // 3. if last member → delete entire group (cascade deletes members + messages)
  if (allMembers.length === 1) {
    await supabase.from("groups").delete().eq("id", groupId);
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    return;
  }

  // 4. insert system message BEFORE leaving (still a member so RLS passes)
  await supabase.from("messages").insert({
    group_id: groupId,
    sender_id: currentUserId,
    receiver_id: null,
    message: `${userName} left the group`,
    message_type: "system",
    status: "sent",
    is_read: true,
  });

  // 5. if current user is the only admin → promote next member before leaving
  const currentMember = allMembers.find((m: any) => m.user_id === currentUserId);
  const isCurrentAdmin = currentMember?.role === "admin";
  const otherAdmins = allMembers.filter(
    (m: any) => m.user_id !== currentUserId && m.role === "admin"
  );

  if (isCurrentAdmin && otherAdmins.length === 0) {
    const nextMember = allMembers.find((m: any) => m.user_id !== currentUserId);
    if (nextMember) {
      await supabase
        .from("group_members")
        .update({ role: "admin" })
        .eq("group_id", groupId)
        .eq("user_id", nextMember.user_id);
    }
  }

  // 6. delete current user from group
  await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", currentUserId);

  setGroups((prev) => prev.filter((g) => g.id !== groupId));
};
  const baseFiltered = conversations.filter((conversation) =>
    conversation.partner?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConversations = baseFiltered.filter((conversation) => {
    const unread = unreadMap[conversation.id] || 0;
    const isOnline = !!onlineMap[conversation.partner.id];
    if (filter === "unread") return unread > 0;
    if (filter === "online") return isOnline;
    return true;
  });

  const filteredGroups = groups.filter((group) => {
  if (filter === "unread") return (unreadMap[group.id] || 0) > 0;
  if (filter === "online") return false; // groups have no online status
  return true;
});

  // only show empty state when user is confirmed loaded and fetch is done
  const showEmptyState = !loading && !isLoading && filteredConversations.length === 0;

  const addGroup = (group: any) => {
  setGroups((prev) => [group, ...prev]);
};

  return {
    conversations,
    filteredConversations,
    filteredGroups,
    groups,  
    onlineMap,
    unreadMap,
    isLoading,
    showEmptyState,
    openConversation,
    leaveGroup,
    search,
    setSearch,
    filter,
    setFilter,
    addGroup,
  };
}
