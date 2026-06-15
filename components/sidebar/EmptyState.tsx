"use client";

type FilterType = "all" | "unread" | "online";
type EmptyStateMode = "no-conversations" | "search" | "unread" | "online";

interface EmptyStateProps {
  hasConversations: boolean;
  searchQuery?: string;
  activeFilter?: FilterType;
}

interface StateConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Static configuration with refined professional micro-copy
const CONFIG: Record<EmptyStateMode, StateConfig> = {
  "no-conversations": {
    title: "No conversations yet",
    description: "Start a new conversation or group using the buttons above.",
    icon: (
      <svg
        aria-hidden="true"
        className="w-6 h-6 text-violet-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
        />
      </svg>
    ),
  },
  search: {
    title: "No results found",
    description: "We couldn't find any matches. Please check the spelling and try again.",
    icon: (
      <svg
        aria-hidden="true"
        className="w-6 h-6 text-violet-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z"
        />
      </svg>
    ),
  },
  unread: {
    title: "You're all caught up",
    description: "There are no unread conversations at the moment.",
    icon: (
      <svg
        aria-hidden="true"
        className="w-6 h-6 text-violet-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
    ),
  },
  online: {
    title: "No contacts online",
    description: "None of your contacts are currently active.",
    icon: (
      <svg
        aria-hidden="true"
        className="w-6 h-6 text-violet-600"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    ),
  },
};

export default function EmptyState({
  hasConversations,
  searchQuery = "",
  activeFilter = "all",
}: EmptyStateProps) {
  const isSearching = searchQuery.trim().length > 0;

  // Determine current active mode
  let mode: EmptyStateMode = "no-conversations";

  if (!hasConversations) {
    mode = "no-conversations";
  } else if (isSearching) {
    mode = "search";
  } else if (activeFilter === "unread") {
    mode = "unread";
  } else if (activeFilter === "online") {
    mode = "online";
  }

  const content = CONFIG[mode];

  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-6 py-12 select-none">
      {/* Decorative Blur Background & Icon Holder */}
      <div className="relative mb-5">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-10 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          }}
        />

        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500/5 to-violet-500/10 border border-violet-500/15 shadow-sm">
          {content.icon}
        </div>
      </div>

      {/* Main Heading Text */}
      <h3 className="text-sm font-semibold tracking-tight text-purple-950 mb-1.5">
        {content.title}
      </h3>

      {/* Auxiliary Description Text */}
      <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
        {content.description}
      </p>
    </div>
  );
}