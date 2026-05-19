"use client";

export default function EmptyState({ hasConversations }: any) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12">
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
        style={{
          background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(167,139,250,0.12) 100%)",
          border: "1px solid rgba(139,92,246,0.12)",
        }}
      >
        <svg className="w-7 h-7" style={{ color: "#c4b5fd" }} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>

      <h3 className="text-sm font-bold" style={{ color: "#2e1065" }}>
        {hasConversations ? "No results found" : "No conversations yet"}
      </h3>

      <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "#b8acd6" }}>
        {hasConversations ? "Try searching with a different name." : "Start messaging from the New Chat button"}
      </p>
    </div>
  );
}
