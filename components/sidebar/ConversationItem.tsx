"use client";

import Avatar from "../ui/Avatar";

export default function ConversationItem({ conversation, isActive, isOnline, unreadCount, onClick }: any) {
  // Only display a timestamp if a message history exists
  const hasMessages = !!conversation.last_message;
  
  const formattedTime = conversation.updated_at && hasMessages
    ? new Date(conversation.updated_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <button
      onClick={onClick}
      className={`
        w-full cursor-pointer relative flex items-center gap-3 px-3 py-2.5 
        rounded-[14px] transition-all duration-200 select-none text-left border
        ${
          isActive
            ? "bg-linear-to-br from-[#7c3aed]/6 to-[#a78bfa]/10 border-[#8b5cf6]/20 shadow-sm"
            : "bg-transparent border-transparent hover:bg-[#8b5cf6]/4 hover:translate-y-[-0.5px] active:translate-y-0"
        }
      `}
    >
      {/* Sleek left-aligned indicator bar for active state */}
      {isActive && (
        <div 
          className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md" 
          style={{ background: "linear-gradient(180deg, #7c3aed, #a78bfa)" }}
        />
      )}

      <div className="relative shrink-0">
        {conversation.isGroup && conversation.avatar_url ? (
  <img
    src={conversation.avatar_url}
    alt={conversation.name}
    className="w-12 h-12 rounded-full object-cover"
    style={{
      boxShadow: isActive ? "0 4px 12px rgba(124,58,237,0.30)" : "0 2px 8px rgba(124,58,237,0.15)",
    }}
  />
) : (
  <Avatar
    name={conversation.isGroup ? conversation.name : conversation.partner.full_name}
    size={48}
    style={{
      background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
      boxShadow: isActive ? "0 4px 12px rgba(124,58,237,0.30)" : "0 2px 8px rgba(124,58,237,0.15)",
    }}
  />
)}
        {!conversation.isGroup && (
          <span
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
            style={{ background: isOnline ? "#10b981" : "#cbd5e1" }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3
          className="text-sm truncate"
          style={{
            color: isActive ? "#5b21b6" : "#1e0a3c",
            fontWeight: isActive ? 700 : 600,
            letterSpacing: "-0.01em",
          }}
        >
          {conversation.isGroup ? conversation.name : conversation.partner.full_name}
        </h3>

        <p
          className="text-[12px] mt-0.5 truncate leading-relaxed"
          style={{
            color: unreadCount > 0 ? "#4c1d95" : "#64748b",
            fontWeight: unreadCount > 0 ? 600 : 400,
          }}
        >
          {conversation.last_message || "Start a conversation"}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {formattedTime && (
          <span className="text-[10px] font-semibold text-slate-400">
            {formattedTime}
          </span>
        )}
        {unreadCount > 0 && (
          <div
            className="min-w-5 h-5 px-1.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
              boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </div>
        )}
      </div>
    </button>
  );
}