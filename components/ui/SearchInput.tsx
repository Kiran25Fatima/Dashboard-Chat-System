import type { ChangeEvent, CSSProperties } from "react";

interface SearchInputProps {
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onClear?: () => void;
  showClear?: boolean;
  className?: string;
  wrapperStyle?: CSSProperties;
  inputStyle?: CSSProperties;
  inputClassName?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  onClear,
  showClear = true,
  className = "",
  wrapperStyle,
  inputStyle,
  inputClassName = "",
}: SearchInputProps) {
  return (
    <div className={className} style={{ position: "relative", ...wrapperStyle }}>
      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
        <svg
          className="w-3.5 h-3.5"
          style={{ color: "#b8acd6" }}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>

      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={inputClassName}
        style={{ paddingLeft: "2.5rem", ...inputStyle }}
      />

      {showClear && value && onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150"
          style={{ background: "rgba(139,92,246,0.10)", color: "#7c3aed" }}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
