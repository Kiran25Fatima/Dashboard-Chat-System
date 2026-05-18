"use client";

import Avatar from "../ui/Avatar";

export default function ConversationItem({ conversation, isActive, isOnline, unreadCount, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer group relative flex items-center gap-3 px-2.5 py-2.5 transition-all duration-200"
      style={{
        borderRadius: "16px",
        background: isActive
          ? "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(167,139,250,0.10) 100%)"
          : "transparent",
        border: isActive ? "1px solid rgba(139,92,246,0.18)" : "1px solid transparent",
        boxShadow: isActive ? "0 4px 16px rgba(109,40,217,0.08)" : "none",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.06)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(139,92,246,0.08)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
        }
      }}
    >
      <div className="relative shrink-0">
        <Avatar
          name={conversation.partner.full_name}
          size={48}
          style={{
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            boxShadow: isActive ? "0 4px 12px rgba(124,58,237,0.30)" : "0 2px 8px rgba(124,58,237,0.15)",
          }}
        />
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
}
