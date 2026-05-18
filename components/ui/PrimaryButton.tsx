import React from "react";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  className?: string;
}

export default function PrimaryButton({ children, onClick, disabled, loading, loadingLabel = "Processing…", className = "" }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        width: "100%",
        marginTop: "1rem",
        padding: "0.875rem 1rem",
        fontSize: "0.875rem",
        fontWeight: 700,
        color: "#ffffff",
        borderRadius: "14px",
        background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
        boxShadow: "0 6px 20px rgba(124,58,237,0.35)",
        letterSpacing: "0.01em",
        transition: "all 150ms",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(124,58,237,0.45)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(124,58,237,0.35)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        }
      }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 999,
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: "rgba(255,255,255,0.35)",
              borderTopColor: "#ffffff",
              display: "inline-block",
              animation: "spin 1s linear infinite",
            }}
          />
          {loadingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
