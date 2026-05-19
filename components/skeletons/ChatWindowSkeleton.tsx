import Skeleton from "@/components/ui/Skeleton";
import MessageListSkeleton from "@/components/skeletons/MessageListSkeleton";

export default function ChatWindowSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: "#ffffff" }}>
      {/* Header */}
      <div
        className="shrink-0 px-5 py-3.5 flex items-center gap-3"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(250,247,255,0.98) 100%)",
          borderBottom: "1px solid rgba(139,92,246,0.09)",
          boxShadow: "0 2px 16px rgba(109,40,217,0.05)",
        }}
      >
        <Skeleton width="40px" height="40px" rounded="999px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="35%" height="12px" rounded="999px" />
          <Skeleton width="20%" height="10px" rounded="999px" />
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-4"
        style={{
          background: "linear-gradient(180deg, #fdfcff 0%, #f9f7ff 60%, #ffffff 100%)",
        }}
      >
        <MessageListSkeleton />
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-3 md:px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(139,92,246,0.10)",
          boxShadow: "0 -10px 30px rgba(109,40,217,0.06)",
        }}
      >
        <Skeleton width="100%" height="48px" rounded="22px" />
      </div>
    </div>
  );
}