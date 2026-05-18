"use client";

import SidebarSkeleton from "@/components/skeletons/SidebarSkeleton";
import EmptyState from "./EmptyState";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  isLoading,
  showEmptyState,
  hasConversations,
  filteredConversations,
  onlineMap,
  unreadMap,
  activeConversationId,
  onOpen,
}: any) {
  return (
    <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-violet-200">
      {isLoading ? (
        <SidebarSkeleton />
      ) : showEmptyState ? (
        <EmptyState hasConversations={hasConversations} />
      ) : (
        <div className="space-y-1 px-0.5">
          {filteredConversations.map((conversation: any) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={activeConversationId === conversation.id}
              isOnline={!!onlineMap[conversation.partner.id]}
              unreadCount={unreadMap[conversation.id] || 0}
              onClick={() => onOpen(conversation)}
            />
          ))}
        </div>
      )}
    </div>
  );
}