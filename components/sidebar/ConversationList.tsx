"use client";

import SidebarSkeleton from "@/components/skeletons/SidebarSkeleton";
import EmptyState from "./EmptyState";
import ConversationItem from "./ConversationItem";

export default function ConversationList({
  isLoading,
  showEmptyState,
  hasConversations,
  filteredConversations,
  groups,
  onlineMap,
  unreadMap,
  activeConversationId,
  onOpen,
  // 1. Add these two new props:
  searchQuery,
  activeFilter,
}: any) {
  return (
    <div className="flex-1 overflow-y-auto px-1 pb-6 scrollbar-thin scrollbar-thumb-violet-100 scrollbar-track-transparent">
      {isLoading ? (
        <SidebarSkeleton />
      ) : showEmptyState && groups.length === 0 ? (
        // 2. Pass them down to the EmptyState component
        <EmptyState 
          hasConversations={hasConversations} 
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />
      ) : (
        <div className="space-y-5">

          {/* Direct Messages Section */}
          {filteredConversations.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 pb-1 text-slate-400/90">
                Direct Messages
              </p>
              <div className="space-y-1">
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
            </div>
          )}

          {/* Groups Section */}
          {groups.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 pb-1 text-slate-400/90">
                Groups
              </p>
              <div className="space-y-1">
                {groups.map((group: any) => (
                  <ConversationItem
                    key={group.id}
                    conversation={group}
                    isActive={activeConversationId === group.id}
                    isOnline={false}
                    unreadCount={unreadMap[group.id] || 0}
                    onClick={() => onOpen(group)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}