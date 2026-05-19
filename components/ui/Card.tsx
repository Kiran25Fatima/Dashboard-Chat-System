import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(255,255,255,0.65)",
        boxShadow: "0 0 0 1px rgba(139,92,246,0.06), 0 32px 64px rgba(109,40,217,0.10), 0 4px 16px rgba(109,40,217,0.06)",
        backdropFilter: "blur(16px)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
