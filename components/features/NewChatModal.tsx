"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Skeleton from "@/components/ui/Skeleton";

import UserListItem from "@/components/features/UserListItem";
import SearchInput from "../ui/SearchInput";
import useCurrentUser from "../../hooks/useCurrentUser";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

export default function NewChatModal({
  onClose,
  onConversationCreated,
}: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useLockBodyScroll();

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const { user } = useCurrentUser();

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);

      const userId = user?.id ?? null;
      setCurrentUserId(userId);

      if (!userId) {
        setUsers([]);
        setIsLoading(true);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .neq("id", userId);

      setUsers(profiles || []);
      setIsLoading(false);
    };

    loadUsers();
  }, [user]);

  const filteredUsers = users.filter((user) =>
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const createOrOpenConversationWithUser = async (user: any) => {
    if (!currentUserId || isCreating) return;

    setIsCreating(true);

    try {
      let existingConversation = null;

      const { data: attempt1, error: error1 } = await supabase
        .from("conversations")
        .select("id,user1_id,user2_id,last_message,updated_at")
        .eq("user1_id", currentUserId)
        .eq("user2_id", user.id)
        .maybeSingle();

      if (!error1 && attempt1) existingConversation = attempt1;

      if (!existingConversation) {
        const { data: attempt2, error: error2 } = await supabase
          .from("conversations")
          .select("id,user1_id,user2_id,last_message,updated_at")
          .eq("user1_id", user.id)
          .eq("user2_id", currentUserId)
          .maybeSingle();

        if (!error2 && attempt2) existingConversation = attempt2;
      }

      let conversation = existingConversation;

      if (!conversation) {
        const { data: createdConversation, error: createError } =
          await supabase
            .from("conversations")
            .insert({
              user1_id: currentUserId,
              user2_id: user.id,
            })
            .select("id,user1_id,user2_id,last_message,updated_at")
            .single();

        if (createError || !createdConversation) {
          setIsCreating(false);
          return;
        }

        conversation = createdConversation;
      }

      if (!conversation) {
        setIsCreating(false);
        return;
      }

      onConversationCreated({
        ...conversation,
        partner: user,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const UserSkeleton = () => (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-100 bg-white shadow-xs">
      <Skeleton width={40} height={40} rounded="12px" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={12} rounded="6px" />
        <Skeleton width="40%" height={10} rounded="6px" />
      </div>
      <Skeleton width={30} height={10} rounded="6px" />
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-auto max-h-[85vh] rounded-2xl overflow-hidden shadow-xl flex flex-col border border-slate-100"
        style={{
          background: "#ffffff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3.5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              New Message
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Select a person to start a conversation
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

        {/* Search Container */}
        <div className="px-6 pt-4 pb-2">
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

        {/* Users List */}
        <div className="px-5 py-4 flex-1 overflow-y-auto space-y-1.5">
          {isLoading || !user ? (
            <>
              <UserSkeleton />
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
                Try another search
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserListItem
                key={user.id}
                user={user}
                disabled={isCreating}
                onClick={() => createOrOpenConversationWithUser(user)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}