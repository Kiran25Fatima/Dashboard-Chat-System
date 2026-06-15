"use client";

import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Avatar from "../ui/Avatar";
import SearchInput from "../ui/SearchInput";
import Skeleton from "@/components/ui/Skeleton";
import useCurrentUser from "@/hooks/useCurrentUser";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

export default function AddGroupMembersModal({
  groupId,
  existingMemberIds,
  onClose,
  onMembersAdded,
}: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  
  const { user } = useCurrentUser();

  useLockBodyScroll();

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .not("id", "in", `(${existingMemberIds.join(",")})`);

      setUsers(profiles || []);
      setIsLoading(false);
    };
    loadUsers();
  }, [existingMemberIds]);

  const filteredUsers = users.filter((u) =>
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (u: any) => {
    setSelectedUsers((prev) =>
      prev.find((s) => s.id === u.id)
        ? prev.filter((s) => s.id !== u.id)
        : [...prev, u]
    );
  };

  const isSelected = (u: any) => selectedUsers.some((s) => s.id === u.id);

  const handleAdd = async () => {
    if (selectedUsers.length === 0) {
      setError("Select at least one person.");
      return;
    }
    if (!user?.id || isAdding) return;

    setIsAdding(true);
    setError("");

    const members = selectedUsers.map((u) => ({ user_id: u.id, role: "member" }));

    const { error: rpcError } = await supabase.rpc("insert_group_members", {
      p_group_id: groupId,
      p_members: members,
    });

    if (rpcError) {
      setError("Failed to add members. Try again.");
      setIsAdding(false);
      return;
    }

    // Fetch adder's name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    const adderName = profile?.full_name || "Someone";
    const addedNames = selectedUsers.map((u: any) => u.full_name).join(", ");

    await supabase.from("messages").insert({
      group_id: groupId,
      sender_id: user.id,
      receiver_id: null,
      message: `${adderName} added ${addedNames}`,
      message_type: "system",
      status: "sent",
      is_read: true,
    });

    onMembersAdded();
  };

  const UserSkeleton = () => (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white shadow-xs animate-pulse">
      <Skeleton width={40} height={40} rounded="12px" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={12} rounded="6px" />
        <Skeleton width="40%" height={10} rounded="6px" />
      </div>
      <Skeleton width={20} height={20} rounded="50%" />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-auto max-h-[85vh] rounded-2xl overflow-hidden shadow-xl flex flex-col border border-slate-100 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3.5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-800">Add Members</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Select people to add to this group
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       bg-slate-50 text-slate-400 border border-slate-200/50
                       hover:bg-slate-100 hover:text-slate-600 active:scale-95 
                       transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Selected Chips Section */}
        {selectedUsers.length > 0 && (
          <div className="px-6 pt-3.5 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {selectedUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                           bg-violet-50 text-violet-700 border border-violet-100/80"
              >
                <span>{u.full_name}</span>
                <button
                  onClick={() => toggleUser(u)}
                  className="cursor-pointer hover:text-violet-950 transition-colors"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search Bar */}
        <div className="px-6 pt-4 pb-2">
          <SearchInput
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            placeholder="Search people..."
            wrapperStyle={{ width: "100%" }}
            inputClassName="w-full h-10 outline-none transition-all duration-200 placeholder:text-slate-400 text-[13px]"
            inputStyle={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              color: "#1e293b",
              fontFamily: "inherit",
              paddingLeft: "2.5rem",
              paddingRight: "1rem",
              boxShadow: "none",
            }}
            onClear={() => setSearch("")}
          />
        </div>

        {/* Scrollable User List */}
        <div className="px-5 py-3 flex-1 overflow-y-auto space-y-1.5">
          {isLoading ? (
            <>
              <UserSkeleton />
              <UserSkeleton />
              <UserSkeleton />
            </>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-semibold text-slate-800">
                No users found
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Everyone is already in this group
              </p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const selected = isSelected(u);
              return (
                <button
                  key={u.id}
                  onClick={() => toggleUser(u)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer text-left border ${
                    selected
                      ? "bg-violet-50/45 border-violet-200/60"
                      : "bg-white border-slate-100 hover:bg-slate-50/50"
                  }`}
                >
                  <Avatar
                    name={u.full_name}
                    size={36}
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #c084fc)",
                    }}
                  />
                  <span className="flex-1 text-[13px] font-semibold text-slate-700 truncate">
                    {u.full_name}
                  </span>
                  
                  {/* Selection Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                      selected
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    {selected && <Check size={11} strokeWidth={3.5} />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Error Output */}
        {error && (
          <p className="text-xs font-medium text-red-500 text-center px-6 pb-2">
            {error}
          </p>
        )}

        {/* Modal Action Footer */}
        <div className="px-6 py-4.5 border-t border-slate-100">
          <button
            onClick={handleAdd}
            disabled={isAdding || selectedUsers.length === 0}
            className="w-full h-11 rounded-xl text-[13px] font-semibold text-white 
                       transition-all duration-200 active:scale-[0.98]
                       disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400
                       disabled:pointer-events-none disabled:shadow-none cursor-pointer
                       bg-violet-600 hover:bg-violet-700 shadow-xs shadow-violet-500/10"
          >
            {isAdding
              ? "Adding..."
              : selectedUsers.length > 0
              ? `Add ${selectedUsers.length} Member${selectedUsers.length > 1 ? "s" : ""}`
              : "Select Members"}
          </button>
        </div>
      </div>
    </div>
  );
}