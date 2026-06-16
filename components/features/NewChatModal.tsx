"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mail } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import SearchInput from "../ui/SearchInput";
import UserListItem from "@/components/features/UserListItem";
import useCurrentUser from "../../hooks/useCurrentUser";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";


export default function NewChatModal({
  onClose,
  onConversationCreated,
}: any) {
  const [email, setEmail] = useState("");
  const [foundUser, setFoundUser] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>("");

  const { user } = useCurrentUser();

  useLockBodyScroll();

  useEffect(() => {
  if (user?.id) {
    setCurrentUserId(user.id);

    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) setCurrentUserName(data.full_name);
      });
  }
}, [user]);

  const handleSearch = async () => {
    if (!email.trim() || !email.includes("@")) return;

    setIsSearching(true);
    setSearched(false);
    setFoundUser(null);
    setInviteSent(false);

    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .eq("email", email.trim().toLowerCase())
      .neq("id", currentUserId)
      .maybeSingle();

    setFoundUser(data || null);
    setSearched(true);
    setIsSearching(false);
  };

  const createOrOpenConversation = async () => {
    if (!currentUserId || !foundUser || isCreating) return;
    setIsCreating(true);

    try {
      const { data: attempt1 } = await supabase
        .from("conversations")
        .select("id,user1_id,user2_id,last_message,updated_at")
        .eq("user1_id", currentUserId)
        .eq("user2_id", foundUser.id)
        .maybeSingle();

      if (attempt1) {
        onConversationCreated({ ...attempt1, partner: foundUser });
        return;
      }

      const { data: attempt2 } = await supabase
        .from("conversations")
        .select("id,user1_id,user2_id,last_message,updated_at")
        .eq("user1_id", foundUser.id)
        .eq("user2_id", currentUserId)
        .maybeSingle();

      if (attempt2) {
        onConversationCreated({ ...attempt2, partner: foundUser });
        return;
      }

      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({ user1_id: currentUserId, user2_id: foundUser.id })
        .select("id,user1_id,user2_id,last_message,updated_at")
        .single();

      if (!createError && newConversation) {
        onConversationCreated({ ...newConversation, partner: foundUser });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // Send invite email
  const handleInvite = async () => {
    if (!currentUserId || isInviting) return;
    setIsInviting(true);

    try {
      const res = await fetch("/api/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          invitedBy: currentUserId,
          invitedByName: currentUserName || "Someone",
        }),
      });

      if (res.ok) {
        setInviteSent(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl flex flex-col border border-slate-100 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3.5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-800">New Message</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Enter email to start a conversation
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 border border-slate-200/50 hover:bg-slate-100 hover:text-slate-600 active:scale-95 transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Email Search */}
        <div
          className="px-6 pt-4 pb-2 flex gap-2"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        >
          <SearchInput
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              setSearched(false);
              setFoundUser(null);
              setInviteSent(false);
            }}
            placeholder="Enter email address..."
            wrapperStyle={{ flex: 1 }}
            inputClassName="w-full h-10 outline-none transition-all duration-200 placeholder:text-slate-400 text-[13px]"
            inputStyle={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              color: "#1e293b",
              fontFamily: "inherit",
              paddingLeft: "2.5rem",
              paddingRight: "1rem",
            }}
            onClear={() => {
              setEmail("");
              setFoundUser(null);
              setSearched(false);
              setInviteSent(false);
            }}
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !email.includes("@")}
            className="px-4 h-10 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            {isSearching ? "..." : "Search"}
          </button>
        </div>

        {/* Result */}
        <div className="px-5 py-4 min-h-30">
          {/* User found */}
          {foundUser && (
            <UserListItem
              user={foundUser}
              disabled={isCreating}
              onClick={createOrOpenConversation}
            />
          )}

          {/* User not found — show invite */}
          {searched && !foundUser && !inviteSent && (
            <div className="text-center py-6">
              <p className="text-sm font-semibold text-slate-800">
                No user found
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                No account exists with this email
              </p>
              <button
                onClick={handleInvite}
                disabled={isInviting}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <Mail size={13} />
                {isInviting ? "Sending..." : "Send Invite"}
              </button>
            </div>
          )}

          {/* Invite sent success */}
          {inviteSent && (
            <div className="text-center py-6">
              <p className="text-sm font-semibold text-slate-800">
                Invite sent! ✅
              </p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                They will appear in your chats once they register.
              </p>
            </div>
          )}

          {/* Default state */}
          {!searched && !isSearching && (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400 font-medium">
                Type an email and press Search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}