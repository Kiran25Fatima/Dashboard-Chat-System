import Skeleton from "@/components/ui/Skeleton";

export default function SidebarSkeleton() {
  return (
    <div className="h-full flex flex-col" style={{ background: "linear-gradient(180deg, #fdfcff 0%, #f8f5ff 100%)" }}>
      <div className="px-4 pt-5 pb-4">
        <Skeleton width="34%" height="10px" rounded="999px" className="mb-3" />
        <Skeleton width="100%" height="44px" rounded="18px" />
      </div>

      <div className="px-5 pb-2 flex items-center justify-between">
        <Skeleton width="24%" height="10px" rounded="999px" />
        <Skeleton width="40px" height="22px" rounded="999px" />
      </div>

      <div className="flex-1 overflow-hidden px-3 pb-4 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-[1.125rem] bg-white/80 shadow-sm"
            style={{ border: "1px solid rgba(139,92,246,0.08)" }}
          >
            <Skeleton width="44px" height="44px" rounded="999px" />
            <div className="flex-1 space-y-2">
              <Skeleton width="60%" height="11px" rounded="999px" />
              <Skeleton width="45%" height="10px" rounded="999px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
