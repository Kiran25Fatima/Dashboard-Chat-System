"use client";

export default function FilterBar({ filter, onChange }: any) {
  return (
    <div
      className="relative flex items-center gap-1 p-1 rounded-xl overflow-hidden"
      style={{
        background: "rgba(139, 92, 246, 0.04)", 
        border: "1px solid rgba(139, 92, 246, 0.06)",
      }}
    >
      {(
        [
          {
            key: "all",
            label: "All",
            icon: (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" />
              </svg>
            ),
          },
          {
            key: "unread",
            label: "Unread",
            icon: (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-8 8 14-14" />
              </svg>
            ),
          },
          {
            key: "online",
            label: "Online",
            icon: <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />,
          },
        ] as const
      ).map((item) => {
        const active = filter === item.key;

        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className="relative flex-1 h-8 rounded-lg flex items-center justify-center gap-1.5 text-[12px] font-semibold cursor-pointer transition-all duration-200 ease-out"
            style={{
             
              background: active ? "#ffffff" : "transparent",
              color: active ? "#6d28d9" : "#7c728a",
              border: active ? "1px solid rgba(139, 92, 246, 0.10)" : "1px solid transparent",
              boxShadow: active ? "0 2px 6px rgba(109, 40, 217, 0.05)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            <span
              className="flex items-center justify-center transition-opacity duration-200"
              style={{ opacity: active ? 1 : 0.65 }}
            >
              {item.icon}
            </span>

            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}