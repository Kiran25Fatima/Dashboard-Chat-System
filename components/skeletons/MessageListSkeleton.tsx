import Skeleton from "@/components/ui/Skeleton";

export default function MessageListSkeleton() {
  const bubbles = [
    { align: "start", width: "45%" },
    { align: "end", width: "30%" },
    { align: "end", width: "20%" },
    { align: "start", width: "55%" },
    { align: "start", width: "35%" },
    { align: "end", width: "40%" },
    { align: "start", width: "25%" },
    { align: "end", width: "30%" },
  ];

  return (
    <div className="flex flex-col gap-3 py-4 px-2">
    
      <div className="flex items-center gap-3 px-2 mb-2">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)" }} />
        <Skeleton width="80px" height="10px" rounded="999px" />
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)" }} />
      </div>

      {bubbles.map((bubble, index) => (
        <div
          key={index}
          className={`flex ${bubble.align === "end" ? "justify-end" : "justify-start"}`}
        >
          {bubble.align === "start" && (
            <Skeleton width="32px" height="32px" rounded="999px" style={{ marginRight: "8px", flexShrink: 0 }} />
          )}
          <Skeleton
            width={bubble.width}
            height="36px"
            rounded={bubble.align === "end" ? "18px 18px 4px 18px" : "18px 18px 18px 4px"}
          />
        </div>
      ))}
    </div>
  );
}