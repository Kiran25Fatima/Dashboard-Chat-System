import type { CSSProperties } from "react";

interface AvatarProps {
  name?: string | null;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const getInitials = (name?: string | null) =>
  name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

export default function Avatar({ name, size = 40, className = "", style = {} }: AvatarProps) {
  const initials = getInitials(name ?? "");

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "white",
    fontSize: Math.max(12, Math.floor(size / 2.6)),
    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    boxShadow: "0 2px 8px rgba(124,58,237,0.18)",
  };

  return (
    <div className={className} style={{ ...baseStyle, ...style }}>
      {initials}
    </div>
  );
}
