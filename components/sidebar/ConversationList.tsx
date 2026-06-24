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
  searchQuery,
  activeFilter,
}: any) {
  return (
    <>
      <style jsx>{`
        .conversa-scroll-local {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.3s ease;
        }
        .conversa-scroll-local:hover {
          scrollbar-color: #ddd6fe transparent;
        }
        .conversa-scroll-local::-webkit-scrollbar {
          width: 5px;
        }
        .conversa-scroll-local::-webkit-scrollbar-track {
          background: transparent;
        }
        .conversa-scroll-local::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 10px;
          transition: background-color 0.3s ease;
        }
        .conversa-scroll-local:hover::-webkit-scrollbar-thumb {
          background-color: #ddd6fe;
        }
        .conversa-scroll-local::-webkit-scrollbar-thumb:hover {
          background-color: #c4b5fd;
        }
      `}</style>
      <div className="flex-1 overflow-y-auto px-1 pb-6 conversa-scroll-local">
        {isLoading ? (
          <SidebarSkeleton />
        ) : showEmptyState && groups.length === 0 ? (
          <EmptyState
            hasConversations={hasConversations}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
          />
        ) : (
          <div className="space-y-5">
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
         {/* Groups section temporarily disabled — group chat feature paused
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
               */}
          </div>
        )}

      </div>
    </>
  );
}