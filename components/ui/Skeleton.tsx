import type { CSSProperties } from "react";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
  style?: CSSProperties;
}

export default function Skeleton({
  width = "100%",
  height = "1rem",
  rounded = "12px",
  className = "",
  style,
}: SkeletonProps) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: rounded,
        background:
          "linear-gradient(90deg, #e5e7eb 0%, #ede9fe 50%, #e5e7eb 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.2s infinite linear",
        ...style,
      }}
    />
  );
}