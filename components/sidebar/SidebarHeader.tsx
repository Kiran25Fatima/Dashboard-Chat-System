"use client";

import { X } from "lucide-react"; // keep import available if used elsewhere

export default function SidebarHeader({ onOpenNewChat }: any) {
  return (
    <div className="sticky top-0 z-20 pt-4 pb-3 space-y-3" style={{ background: "linear-gradient(180deg, rgba(253,252,255,0.99) 80%, transparent 100%)" }}>
      <div className="flex items-center justify-between ml-2 mb-2">
        <p className="text-[10px] font-bold tracking-[0.16em] uppercase leading-none" style={{ color: "#7c3aed" }}>
          Conversations
        </p>

        <button
          type="button"
          onClick={onOpenNewChat}
          className="group relative flex items-center gap-2 text-[11px] font-semibold px-3 py-2 rounded-xl cursor-pointer
             transition-all duration-200
             hover:-translate-y-px
             hover:shadow-lg hover:shadow-violet-200"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(167,139,250,0.12))",
            color: "#5b21b6",
            border: "1px solid rgba(139,92,246,0.18)",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
          </svg>

          <span>New Chat</span>

          <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "radial-gradient(circle at center, rgba(167,139,250,0.25), transparent 70%)" }} />
        </button>
      </div>

    </div>
  );
}
