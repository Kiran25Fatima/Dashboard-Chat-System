import type { CSSProperties, ReactNode } from "react";

interface AuthSplitLayoutProps {
  hero: ReactNode;
  content?: ReactNode;
  children?: ReactNode;
  contentStyle?: CSSProperties;
  className?: string;
}

export default function AuthSplitLayout({
  hero,
  content,
  children,
  contentStyle,
  className = "",
}: AuthSplitLayoutProps) {
  return (
    <div
      className={`min-h-screen flex ${className}`}
      style={{
        background: "linear-gradient(135deg, #f8f5ff 0%, #ede9fe 40%, #faf8ff 100%)",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        colorScheme: "light",
      }}
    >
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {hero}
      </div>

      <div
        className="w-full md:w-1/2 flex items-center justify-center px-4 sm:px-6 py-10 lg:py-12 relative overflow-hidden"
        style={contentStyle}
      >
        {children ?? content}
      </div>
    </div>
  );
}
