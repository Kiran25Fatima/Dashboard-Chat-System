"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Skeleton from "@/components/ui/Skeleton";
import { MessageCircle } from "lucide-react";

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);

      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id ?? null;
      setCurrentUserId(userId);

      if (!userId) {
        setUsers([]);
        setIsLoading(false);
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
  }, []);

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
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-violet-100 bg-white">
      <Skeleton width={40} height={40} rounded="14px" />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={12} rounded="6px" />
        <Skeleton width="40%" height={10} rounded="6px" />
      </div>
      <Skeleton width={30} height={10} rounded="6px" />
    </div>
  );

  return (
    <div
className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-3 py-4"      onClick={onClose}
    >
      <div
 className="w-full max-w-md h-auto max-h-[85vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col"        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)",
          border: "1px solid rgba(139,92,246,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
    
        <div className="px-5 pt-4 pb-3 border-b border-violet-100 flex justify-between items-center">
          <div>
            <h2 className="text-[15px] font-bold text-[#1e0a3c]">
              New Message
            </h2>
            <p className="text-xs text-violet-500 mt-0.5">
              Select a person to start a conversation
            </p>
          </div>

         <button
  onClick={onClose}
  className="w-8 h-8 flex items-center justify-center rounded-full
             bg-violet-50 text-violet-700 border border-violet-100
             hover:bg-violet-100 hover:border-violet-200
             active:scale-95 transition cursor-pointer"
>
  <X size={16} />
</button>
        </div>

   
        <div className="px-5 pt-4">
          <input
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search people..."
            className="w-full h-10 sm:h-11 px-3 sm:px-4 text-sm rounded-xl outline-none
                       border border-violet-100 shadow-sm
                       focus:border-violet-300 focus:ring-2 focus:ring-violet-100
                       transition"
          />
        </div>


        <div className="px-4 py-4 flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <>
              <UserSkeleton />
              <UserSkeleton />
              <UserSkeleton />
              <UserSkeleton />
            </>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-semibold text-[#1e0a3c]">
                No users found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try another search
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                disabled={isCreating}
                onClick={() =>
                  createOrOpenConversationWithUser(user)
                }
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-violet-100 bg-white
                           hover:bg-violet-50 hover:border-violet-200
                           active:scale-[0.98] transition text-left cursor-pointer "
              >
                <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-violet-600 to-violet-300 text-white flex items-center justify-center font-bold text-sm">
                  {getInitials(user.full_name)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1e0a3c] truncate">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Click to start chat
                  </p>
                </div>

                <MessageCircle
                  size={18}
                  className="text-violet-600 shrink-0"
                />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}