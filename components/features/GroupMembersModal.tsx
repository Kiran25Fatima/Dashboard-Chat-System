"use client";

import { useEffect, useState } from "react";
import { X, UserPlus } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Avatar from "../ui/Avatar";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import useCurrentUser from "@/hooks/useCurrentUser";
import AddGroupMembersModal from "./AddGroupMembersModal";

export default function GroupMembersModal({ groupId, onClose }: any) {
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const { user } = useCurrentUser();

  useLockBodyScroll();

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("group_members")
      .select("user_id, role")
      .eq("group_id", groupId);

    if (!data || data.length === 0) {
      setIsLoading(false);
      return;
    }

    // check if current user is admin
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
  }, [groupId]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-3"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[70vh]"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)",
            border: "1px solid rgba(139,92,246,0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-violet-100 flex justify-between items-center">
            <div>
              <h2 className="text-[15px] font-bold text-[#1e0a3c]">Members</h2>
              <p className="text-xs text-violet-400 mt-0.5">{members.length} people</p>
            </div>
            <div className="flex items-center gap-2">
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
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="px-4 py-3 overflow-y-auto space-y-2">
            {isLoading ? (
              <p className="text-sm text-center text-violet-300 py-6">Loading...</p>
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
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
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
      </div>

      {showAddMembers && (
        <AddGroupMembersModal
          groupId={groupId}
          existingMemberIds={members.map((m) => m.id)}
          onClose={() => setShowAddMembers(false)}
          onMembersAdded={() => {
            fetchMembers(); // refresh list
            setShowAddMembers(false);
          }}
        />
      )}
    </>
  );
}