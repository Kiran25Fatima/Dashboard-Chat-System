"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import SearchInput from "../ui/SearchInput";
import useCurrentUser from "../../hooks/useCurrentUser";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import Avatar from "../ui/Avatar";
import { useSupabase } from "../providers/AuthProvider";

export default function CreateGroupModal({ onClose, onGroupCreated }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const groupNameRef = useRef<HTMLInputElement | null>(null);
  const { user } = useCurrentUser();
  const { supabase } = useSupabase();
  useLockBodyScroll();

  useEffect(() => {
    groupNameRef.current?.focus();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      const userId = user?.id ?? null;
      if (!userId) return;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .neq("id", userId);

      setUsers(profiles || []);
      setIsLoading(false);
    };

    loadUsers();
  }, [user]);

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

  const createGroup = async () => {
    if (!groupName.trim()) { setError("Please enter a group name."); return; }
    if (selectedUsers.length < 2) { setError("Add at least 2 members."); return; }
    if (!user?.id || isCreating) return;

    setIsCreating(true);
    setError("");

    try {
      // 1. Create group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({ name: groupName.trim(), created_by: user.id })
        .select("id, name, avatar_url, created_at")
        .single();

      if (groupError) throw groupError;
      if (!group) throw new Error("Group creation failed");

      // 2. Insert members (creator as admin + selected users as members)
      const members = [
        { user_id: user.id, role: "admin" },
        ...selectedUsers.map((u) => ({ user_id: u.id, role: "member" })),
      ];

      const { error: membersError } = await supabase.rpc("insert_group_members", {
        p_group_id: group.id,
        p_members: members,
      });

      if (membersError) throw membersError;
      // fetch creator's name
const { data: profile } = await supabase
  .from("profiles")
  .select("full_name")
  .eq("id", user.id)
  .single();

const userName = profile?.full_name || "Someone";

// insert system message
await supabase.from("messages").insert({
  group_id: group.id,
  sender_id: user.id,
  receiver_id: null,
  message: `${userName} created the group`,
  message_type: "system",
  status: "sent",
  is_read: true,
});
const addedNames = selectedUsers.map((u: any) => u.full_name).join(", ");
await supabase.from("messages").insert({
  group_id: group.id,
  sender_id: user.id,
  message: `${userName} added ${addedNames}`,
  message_type: "system",
  status: "sent",
  is_read: true,
});

      onGroupCreated({ ...group, isGroup: true, last_message: "", updated_at: group.created_at });
      onClose();
    } catch (err: any) {
      console.error("FULL ERROR:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };
  

  const UserSkeleton = () => (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white shadow-xs">
      <Skeleton width={40} height={40} rounded="12px" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={12} rounded="6px" />
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-auto max-h-[90vh] rounded-2xl overflow-hidden shadow-xl flex flex-col border border-slate-100"
        style={{
          background: "#ffffff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3.5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-800">New Group</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Name your group and add members
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

        {/* Group name input */}
        <div className="px-6 pt-4">
          <input
            ref={groupNameRef}
            type="text"
            placeholder="Group name..."
            value={groupName}
            onChange={(e) => { setGroupName(e.target.value); setError(""); }}
            className="w-full h-10 rounded-xl border border-slate-200 bg-[#f8fafc] px-4 outline-none transition-all duration-200 placeholder:text-slate-400 text-[13px] focus:border-violet-500/40 focus:ring-4 focus:ring-violet-500/[0.05] text-slate-800"
          />
        </div>

        {/* Selected members chips */}
        {selectedUsers.length > 0 && (
          <div className="px-6 pt-3 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {selectedUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-100/60"
              >
                {u.full_name}
                <button onClick={() => toggleUser(u)} className="cursor-pointer hover:text-violet-950 transition-colors">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-6 pt-3">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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

        {/* User list */}
        <div className="px-5 py-4 flex-1 overflow-y-auto space-y-1.5">
          {isLoading ? (
            <>
              <UserSkeleton />
              <UserSkeleton />
              <UserSkeleton />
            </>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-semibold text-slate-800">No users found</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Try another search</p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const active = isSelected(u);
              return (
                <button
                  key={u.id}
                  onClick={() => toggleUser(u)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-150 cursor-pointer text-left
                    ${
                      active
                        ? "bg-gradient-to-br from-violet-500/[0.04] to-violet-500/[0.08] border-violet-500/20"
                        : "bg-white border-slate-100 hover:bg-slate-50/50"
                    }
                  `}
                >
                  <Avatar
                    name={u.full_name}
                    size={40}
                    style={{
                      background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                    }}
                  />
                  <span
                    className={`flex-1 text-sm truncate ${active ? "font-bold text-violet-950" : "font-semibold text-slate-800"}`}
                  >
                    {u.full_name}
                  </span>
                  {active && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "linear-gradient(135deg, #7c3aed, #9333ea)" }}
                    >
                      <Check size={11} strokeWidth={3} color="white" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-500 font-semibold text-center px-5 pb-2">{error}</p>
        )}

        {/* Create button */}
        <div className="px-6 py-4 border-t border-slate-100">
          <button
            onClick={createGroup}
            disabled={isCreating}
            className="w-full h-11 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #9333ea)",
              boxShadow: "0 4px 16px rgba(124,58,237,0.18)",
            }}
          >
            {isCreating ? "Creating..." : `Create Group${selectedUsers.length > 0 ? ` (${selectedUsers.length + 1})` : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}