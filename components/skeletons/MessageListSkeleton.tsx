import Skeleton from "@/components/ui/Skeleton";

export default function MessageListSkeleton() {
  const placeholders = [
    { align: "start", width: "60%" },
    { align: "end", width: "52%" },
    { align: "start", width: "70%" },
    { align: "end", width: "45%" },
  ];

  return (
    <div className="flex flex-col min-h-full gap-4 py-4" style={{ background: "linear-gradient(180deg, #fdfcff 0%, #f9f7ff 65%, #ffffff 100%)" }}>
      <div className="px-4 flex items-center gap-3">
        <Skeleton width="26%" height="10px" rounded="999px" />
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)" }} />
      </div>
      <div className="space-y-4 px-4">
        {placeholders.map((item, index) => (
          <div
            key={index}
            className={`flex ${item.align === "end" ? "justify-end" : "justify-start"}`}
          >
            <div className="space-y-2 w-full max-w-[85%] md:max-w-[68%]">
              <Skeleton width={item.width} height="14px" rounded="18px" />
              <Skeleton width="90%" height="14px" rounded="18px" />
            </div>
          </div>
         ))}
      </div>
      <div className="px-4 pt-4">
        <Skeleton width="100%" height="56px" rounded="28px" />
      </div>
    </div>
  );
}
