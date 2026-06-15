"use client";

import { useState } from "react";
import SearchInput from "../ui/SearchInput";

export default function SidebarSearch({ value, onChange, onClear }: any) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div 
      className="px-0.5 pb-2"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder="Search conversations..."
        onClear={onClear}
        wrapperStyle={{ width: "100%" }}
        inputClassName="w-full h-9 text-[12.5px] outline-none transition-all duration-200 placeholder:font-normal placeholder:text-slate-400"
        inputStyle={{
          // Neutral soft-grey when inactive; pure white when focused
          background: isFocused ? "#ffffff" : "#f8fafc",
          border: isFocused 
            ? "1px solid rgba(124, 58, 237, 0.45)" // Elegant focused violet border
            : "1px solid #e2e8f0", // Clean Slate-200 inactive border
          borderRadius: "12px",
          color: "#1e293b", // Slate-800 text color for professional readability
          fontFamily: "inherit",
          // Modern, minimal glow ring on focus
          boxShadow: isFocused 
            ? "0 0 0 3px rgba(124, 58, 237, 0.08), 0 2px 4px rgba(0, 0, 0, 0.02)" 
            : "none",
          transition: "all 0.2s ease-in-out",
        }}
      />
    </div>
  );
}