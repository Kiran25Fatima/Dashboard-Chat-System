"use client";

import { useEffect } from "react";
import useCurrentUser from "../../hooks/useCurrentUser";
import useConversations from "@/hooks/useConversations";
import SidebarHeader from "@/components/sidebar/SidebarHeader";
import SidebarSearch from "@/components/sidebar/SidebarSearch";
import FilterBar from "@/components/sidebar/FilterBar";
import ConversationList from "@/components/sidebar/ConversationList";

export default function Sidebar(props: any) {
  const { onSelectConversation, selectedConversationId, onOpenNewChat, newConversation, onUpdateSelectedConversation } = props;
  const { user, loading } = useCurrentUser();

  const {
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
    conversations,
  } = useConversations({ user, selectedConversationId, newConversation, onSelectConversation, loading });

  useEffect(() => {
    if (!selectedConversationId || !onUpdateSelectedConversation) return;
    const selected = conversations.find((conversation: any) => conversation.id === selectedConversationId);
    if (selected) {
      onUpdateSelectedConversation(selected);
    }
  }, [conversations, selectedConversationId, onUpdateSelectedConversation]);

  return (
    <div
      className="h-full flex flex-col select-none border-r backdrop-blur-xl px-3 bg-[#fbfaff]"
      style={{
        background: "linear-gradient(180deg, #fcfbff 0%, #f7f4ff 100%)",
        borderColor: "rgba(139,92,246,0.08)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <SidebarHeader onOpenNewChat={onOpenNewChat} />
      <SidebarSearch
        value={search}
        onChange={(e: any) => setSearch(e.target.value)}
        onClear={() => setSearch("")}
      />

      <div className="px-0.5 pb-3 space-y-4">
        <FilterBar filter={filter} onChange={setFilter} />
        <div className="flex items-center justify-between px-1">
          <p
            className="text-[11px] font-bold uppercase tracking-[0.16em]"
            style={{ color: "#7c3aed" }}
          >
            Chats
          </p>
        </div>
      </div>

      <ConversationList
        isLoading={isLoading}
        showEmptyState={showEmptyState}
        hasConversations={conversations.length > 0}
        filteredConversations={filteredConversations}
        onlineMap={onlineMap}
        unreadMap={unreadMap}
        activeConversationId={selectedConversationId}
        onOpen={openConversation}
      />
    </div>
  );
}