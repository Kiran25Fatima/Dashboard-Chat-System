"use client";

export default function FilterBar({ filter, onChange }: any) {
  return (
    <div
      className="relative flex items-center gap-1.5 p-1.5 rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(139,92,246,0.10)",
        boxShadow: "0 6px 20px rgba(109,40,217,0.05)",
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
            icon: <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />,
          },
        ] as const
      ).map((item) => {
        const active = filter === item.key;

        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className="relative flex-1 h-11 rounded-xl flex items-center justify-center gap-2 text-[12px] font-semibold  cursor-pointer transition-all duration-300 ease-out"
            style={{
              background: active
                ? "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(167,139,250,0.16) 100%)"
                : "rgba(255,255,255,0.45)",

              color: active ? "#5b21b6" : "#6b5a99",

              border: active ? "1px solid rgba(139,92,246,0.16)" : "1px solid rgba(139,92,246,0.06)",

              boxShadow: active ? "0 4px 14px rgba(124,58,237,0.10)" : "0 1px 2px rgba(15,23,42,0.03)",

              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(167,139,250,0.10))";

                e.currentTarget.style.borderColor = "rgba(139,92,246,0.12)";

                e.currentTarget.style.transform = "translateY(-1px)";
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.background = "rgba(255,255,255,0.45)";

                e.currentTarget.style.borderColor = "rgba(139,92,246,0.06)";

                e.currentTarget.style.transform = "translateY(0px)";
              }
            }}
          >
            <span className="flex items-center justify-center" style={{ opacity: active ? 1 : 0.82 }}>
              {item.icon}
            </span>

            <span>{item.label}</span>

            {active && (
              <span className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.12), transparent)" }} />
            )}
          </button>
        );
      })}
    </div>
  );
}
