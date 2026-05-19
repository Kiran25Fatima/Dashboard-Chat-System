import type { CSSProperties } from "react";

interface FormErrorProps {
  message: string;
  className?: string;
  style?: CSSProperties;
  iconColor?: string;
}

export default function FormError({
  message,
  className = "",
  style,
  iconColor = "#dc2626",
}: FormErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "1rem",
        borderRadius: "1rem",
        background: "rgba(254,242,242,0.9)",
        border: "1px solid rgba(239,68,68,0.15)",
        color: iconColor,
        fontSize: "0.9rem",
        fontWeight: 500,
        ...style,
      }}
    >
      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </div>
  );
}
