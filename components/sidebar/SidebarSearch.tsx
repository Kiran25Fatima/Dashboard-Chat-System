"use client";

import SearchInput from "../ui/SearchInput";

export default function SidebarSearch({ value, onChange, onClear }: any) {
  return (
    <div
      className="px-1 pb-3"
      onFocusCapture={(e) => {
        const input = e.currentTarget.querySelector("input") as HTMLInputElement;
        if (input) {
          input.style.borderColor = "rgba(139,92,246,0.38)";
          input.style.boxShadow =
            "0 0 0 4px rgba(139,92,246,0.07), 0 2px 16px rgba(109,40,217,0.10)";
        }
      }}
      onBlurCapture={(e) => {
        const input = e.currentTarget.querySelector("input") as HTMLInputElement;
        if (input) {
          input.style.borderColor = "rgba(139,92,246,0.16)";
          input.style.boxShadow = "0 2px 12px rgba(109,40,217,0.07)";
        }
      }}
    >
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder="Search..."
        onClear={onClear}
        wrapperStyle={{ width: "100%" }}
        inputClassName="w-full h-10 text-sm outline-none transition-all duration-200 placeholder:font-normal placeholder:text-[#b8acd6]"
        inputStyle={{
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(139,92,246,0.16)",
          borderRadius: "14px",
          color: "#1e0a3c",
          fontFamily: "inherit",
          boxShadow: "0 2px 12px rgba(109,40,217,0.07)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      />
    </div>
  );
}