"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  onDeleteForEveryone: () => void;
}

export default function MessageActions({
  onDeleteForEveryone,
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* 3 dots button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="
          w-7 h-7
          flex items-center justify-center
          rounded-full
          opacity-0 group-hover:opacity-100
          transition-all duration-150
          hover:bg-black/5
          active:scale-95
          cursor-pointer
        "
      >
        <MoreHorizontal
          size={16}
          strokeWidth={2.3}
          className="text-violet-500"
        />
      </button>

      {/* dropdown */}
      {open && (
        <div
          className="
         absolute
      top-1/2
      -translate-y-1/2
      right-8
      min-w-47.5
      rounded-2xl
      overflow-hidden
      z-50
    animate-in fade-in zoom-in-95 duration-100
          "
          style={{
            background: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(139,92,246,0.10)",
            boxShadow:
              "0 10px 30px rgba(109,40,217,0.10), 0 2px 8px rgba(0,0,0,0.06)",
            backdropFilter: "blur(16px)",
          }}
        >
          <button
            onClick={() => {
              onDeleteForEveryone();
              setOpen(false);
            }}
            className="
              w-full
              flex items-center gap-3
              px-4 py-3
              text-sm
              transition-colors
              hover:bg-violet-50
              cursor-pointer
            "
            style={{
              color: "#5b21b6",
              fontWeight: 500,
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "rgba(139,92,246,0.10)",
              }}
            >
              <Trash2
                size={14}
                strokeWidth={2.1}
              />
            </div>

            <div className="flex flex-col items-start">
              <span>Delete message</span>

              <span
                className="text-[11px]"
                style={{
                  color: "#9f8cc9",
                  fontWeight: 400,
                }}
              >
                Remove for everyone
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}