import Skeleton from "@/components/ui/Skeleton";

export default function SidebarSkeleton() {
  return (
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

         
          <Skeleton width="32px" height="10px" rounded="999px" />
        </div>
      ))}
    </div>
  );
}