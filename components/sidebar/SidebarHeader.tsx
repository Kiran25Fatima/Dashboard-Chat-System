"use client";

export default function SidebarHeader({ onOpenNewChat, onOpenNewGroup }: any) {
  return (
    <div className="sticky top-0 z-20 pt-4 pb-3 px-0.5 space-y-3 bg-transparent">
      {/* Actions row is now at the top, giving a cleaner, immediate entry point */}
      <div className="flex gap-2.5 w-full">
        {/* Primary Action Button: New Chat */}
        <button
          type="button"
          onClick={onOpenNewChat}
          className="flex-1 flex items-center justify-center gap-1.5 text-[11.5px] font-bold h-9 rounded-xl bg-violet-600 hover:bg-violet-700 active:scale-[0.98] text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer border border-transparent"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m-7-7h14" />
          </svg>
          New Chat
        </button>

        {/* Secondary Action Button: New Group, Temporarily disabled — group chat feature paused */}
        {/* <button
          type="button"
          onClick={onOpenNewGroup}
          className="flex-1 flex items-center justify-center gap-1.5 text-[11.5px] font-semibold h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] text-slate-600 shadow-sm transition-all duration-200 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 20h5v-2a4 4 0 00-5-4.33M9 20H4v-2a4 4 0 015-4.33M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          New Group
        </button> */}
      </div>
    </div>
  );
}