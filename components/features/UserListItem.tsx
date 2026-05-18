import Avatar from "@/components/ui/Avatar";
import { MessageCircle } from "lucide-react";
import type { CSSProperties } from "react";

interface UserListItemProps {
  user: {
    id: string;
    full_name?: string;
  };
  disabled?: boolean;
  onClick: () => void;
  style?: CSSProperties;
}

export default function UserListItem({
  user,
  disabled = false,
  onClick,
  style,
}: UserListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-violet-100 bg-white hover:bg-violet-50 hover:border-violet-200 active:scale-[0.98] transition text-left cursor-pointer"
      style={style}
    >
      <Avatar name={user.full_name} size={40} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#1e0a3c] truncate">
          {user.full_name}
        </p>
        <p className="text-xs text-gray-400">Click to start chat</p>
      </div>

      <MessageCircle size={18} className="text-violet-600 shrink-0" />
    </button>
  );
}
