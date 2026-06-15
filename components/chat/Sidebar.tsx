"use client";

import { useEffect, useState } from "react";
import useCurrentUser from "../../hooks/useCurrentUser";
import useConversations from "@/hooks/useConversations";
import SidebarHeader from "@/components/sidebar/SidebarHeader";
import SidebarSearch from "@/components/sidebar/SidebarSearch";
import FilterBar from "@/components/sidebar/FilterBar";
import ConversationList from "@/components/sidebar/ConversationList";

export default function Sidebar(props: any) {
  const { onSelectConversation, selectedConversationId, onOpenNewChat, newConversation, onUpdateSelectedConversation, onOpenNewGroup, onLeaveGroupReady } = props;
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
    groups,   
    filter,
    setFilter,
    conversations,
    leaveGroup,
    filteredGroups
  } = useConversations({ user, selectedConversationId, newConversation, onSelectConversation, loading });

  useEffect(() => {
  if (onLeaveGroupReady && leaveGroup) {
    onLeaveGroupReady(leaveGroup);
  }
}, [leaveGroup]);

  useEffect(() => {
    if (!selectedConversationId || !onUpdateSelectedConversation) return;
    const selected = conversations.find((conversation: any) => conversation.id === selectedConversationId);
    if (selected) {
      onUpdateSelectedConversation(selected);
    }
  }, [conversations, selectedConversationId, onUpdateSelectedConversation]);

  return (
    <div
      className="h-full flex flex-col select-none px-4 py-2"
      style={{
        background: "linear-gradient(180deg, #FDFDFD 0%, #F9F8FD 100%)",
        borderRight: "1px solid #E2E8F0", 
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <SidebarHeader onOpenNewChat={onOpenNewChat} onOpenNewGroup={onOpenNewGroup} />
      
      <div className="my-3">
        <SidebarSearch
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </div>

      {/* Kept only the FilterBar here, removing the redundant "Chats" text */}
      <div className="px-0.5 pb-4">
        <FilterBar filter={filter} onChange={setFilter} />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ConversationList
          isLoading={isLoading}
          showEmptyState={showEmptyState}
          hasConversations={conversations.length > 0}
          filteredConversations={filteredConversations}
         groups={filteredGroups}
          onlineMap={onlineMap}
          unreadMap={unreadMap}
          activeConversationId={selectedConversationId}
          onOpen={openConversation}
            searchQuery={search}
          activeFilter={filter}
          
        />
      </div>
    </div>
  );
}