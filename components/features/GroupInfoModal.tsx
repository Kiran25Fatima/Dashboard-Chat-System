"use client";

import { useEffect, useRef, useState } from "react";
import { X, UserPlus, Camera, Check, Pencil } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Avatar from "../ui/Avatar";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import useCurrentUser from "@/hooks/useCurrentUser";
import AddGroupMembersModal from "./AddGroupMembersModal";

export default function GroupInfoModal({ group, onClose, onGroupUpdated, onLeaveGroup }: any) {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);

  // name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(group?.name || "");
  const [isSavingName, setIsSavingName] = useState(false);

  // avatar
  const [avatarUrl, setAvatarUrl] = useState(group?.avatar_url || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useCurrentUser();
  useLockBodyScroll();

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("group_members")
      .select("user_id, role")
      .eq("group_id", group.id);

    if (!data || data.length === 0) {
      setIsLoading(false);
      return;
    }

    const currentMember = data.find((m: any) => m.user_id === user?.id);
    setIsAdmin(currentMember?.role === "admin");

    const userIds = data.map((m: any) => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const roleMap: Record<string, string> = {};
    data.forEach((m: any) => { roleMap[m.user_id] = m.role; });

    const merged = (profiles || []).map((p: any) => ({
      ...p,
      role: roleMap[p.id],
    }));
    merged.sort((a, b) => (a.role === "admin" ? -1 : 1));
    setMembers(merged);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [group.id]);

  const saveGroupName = async () => {
    const trimmed = editedName.trim();
    if (!trimmed || trimmed === group.name) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    const { error } = await supabase
      .from("groups")
      .update({ name: trimmed })
      .eq("id", group.id);

    if (!error) {
      onGroupUpdated?.({ ...group, name: trimmed, avatar_url: avatarUrl });
    }
    setIsSavingName(false);
    setIsEditingName(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setIsUploadingAvatar(true);
    const filePath = `${group.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("group-avatars")
      .upload(filePath, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from("group-avatars").getPublicUrl(filePath);
      const newAvatarUrl = data.publicUrl;
      await supabase.from("groups").update({ avatar_url: newAvatarUrl }).eq("id", group.id);
      setAvatarUrl(newAvatarUrl);
      onGroupUpdated?.({ ...group, name: editedName || group.name, avatar_url: newAvatarUrl });
    }
    setIsUploadingAvatar(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-3"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)",
            border: "1px solid rgba(139,92,246,0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-violet-100 flex justify-between items-center">
            <h2 className="text-[15px] font-bold text-[#1e0a3c]">Group Info</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100 transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Avatar + Name */}
          <div className="flex flex-col items-center px-5 py-6 border-b border-violet-100">
            {/* Avatar with upload button */}
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Group avatar"
                  className="w-20 h-20 rounded-full object-cover"
                  style={{ boxShadow: "0 4px 16px rgba(124,58,237,0.20)" }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.20)",
                  }}
                >
                  {group?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              {isAdmin && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                    boxShadow: "0 2px 8px rgba(124,58,237,0.35)",
                  }}
                >
                  {isUploadingAvatar ? (
                    <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <Camera size={13} color="white" />
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarUpload}
              />
            </div>

            {/* Group name */}
            <div className="mt-4 flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveGroupName();
                      if (e.key === "Escape") {
                        setIsEditingName(false);
                        setEditedName(group.name);
                      }
                    }}
                    className="text-lg font-bold outline-none text-center border-b-2 bg-transparent"
                    style={{
                      borderColor: "#7c3aed",
                      color: "#1e0a3c",
                      minWidth: "120px",
                      maxWidth: "200px",
                    }}
                  />
                  <button
                    onClick={saveGroupName}
                    disabled={isSavingName}
                    className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
                  >
                    {isSavingName ? (
                      <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Check size={13} color="white" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setEditedName(group.name);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <X size={13} color="#9ca3af" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold" style={{ color: "#1e0a3c" }}>
                    {editedName || group?.name}
                  </h3>
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="cursor-pointer hover:opacity-70 transition shrink-0"
                    >
                      <Pencil size={14} color="#b8acd6" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Members list */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <p
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "#a78bfa" }}
              >
                {members.length} Members
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMembers(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:-translate-y-px"
                  style={{
                    background: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(167,139,250,0.12))",
                    color: "#5b21b6",
                    border: "1px solid rgba(139,92,246,0.18)",
                  }}
                >
                  <UserPlus size={13} />
                  Add
                </button>
              )}
            </div>
            <div className="px-4 pb-4 space-y-2">
              {isLoading ? (
                <p className="text-sm text-center text-violet-300 py-4">Loading...</p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                    style={{
                      background: "rgba(139,92,246,0.04)",
                      border: "1px solid rgba(139,92,246,0.08)",
                    }}
                  >
                    <Avatar
                      name={member.full_name}
                      size={38}
                      style={{ background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#1e0a3c" }}>
                        {member.full_name}
                      </p>
                    </div>
                    {member.role === "admin" && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          background: "linear-gradient(135deg, rgba(124,58,237,0.10), rgba(167,139,250,0.15))",
                          color: "#7c3aed",
                          border: "1px solid rgba(139,92,246,0.20)",
                        }}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
               <div className="px-5 py-4 border-t border-violet-100">
            <button
              onClick={() => {
                if (confirm("Leave this group?")) {
                  onLeaveGroup?.(group.id);
                  onClose();
                }
              }}
              className="w-full h-10 rounded-2xl text-sm font-semibold transition-all duration-200 hover:opacity-80 cursor-pointer"
              style={{
                background: "rgba(239,68,68,0.06)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              Leave Group
            </button>
          </div>

        </div>
      </div>

      {showAddMembers && (
        <AddGroupMembersModal
          groupId={group.id}
          existingMemberIds={members.map((m) => m.id)}
          onClose={() => setShowAddMembers(false)}
          onMembersAdded={() => {
            fetchMembers();
            setShowAddMembers(false);
          }}
        />
      )}
    </>
  );
}