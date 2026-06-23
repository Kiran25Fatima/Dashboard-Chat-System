"use client";

import { useEffect, useState } from "react";
import { LogOut, User, Settings, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import useCurrentUser from "../../hooks/useCurrentUser";
import useConversations from "@/hooks/useConversations";
import SidebarHeader from "@/components/sidebar/SidebarHeader";
import SidebarSearch from "@/components/sidebar/SidebarSearch";
import FilterBar from "@/components/sidebar/FilterBar";
import ConversationList from "@/components/sidebar/ConversationList";


export default function Sidebar(props: any) {
  const { onSelectConversation, selectedConversationId, onOpenNewChat, newConversation, onUpdateSelectedConversation, onOpenNewGroup, onLeaveGroupReady, onOpenProfile } = props;
  const { user, loading } = useCurrentUser();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const {
    filteredConversations,
    onlineMap,
    unreadMap,
    isLoading,
    showEmptyState,
    openConversation,
    search,
    setSearch,
    groups,
    filter,
    setFilter,
    conversations,
    leaveGroup,
    filteredGroups
  } = useConversations({ user, selectedConversationId, newConversation, onSelectConversation, loading });

  useEffect(() => {
    if (onLeaveGroupReady && leaveGroup) {
      onLeaveGroupReady(leaveGroup);
    }
  }, [leaveGroup]);

  useEffect(() => {
  if (!user?.id) return;
  supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single()
    .then(({ data }) => {
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    });
}, [user]);

  useEffect(() => {
    if (!selectedConversationId || !onUpdateSelectedConversation) return;
    const selected = conversations.find((conversation: any) => conversation.id === selectedConversationId);
    if (selected) {
      onUpdateSelectedConversation(selected);
    }
  }, [conversations, selectedConversationId, onUpdateSelectedConversation]);

  return (
    <div
      className="h-full flex flex-col select-none px-4 py-2"
      style={{
        background: "linear-gradient(180deg, #FDFDFD 0%, #F9F8FD 100%)",
        borderRight: "1px solid #E2E8F0",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      <SidebarHeader onOpenNewChat={onOpenNewChat} onOpenNewGroup={onOpenNewGroup} />

      <div className="my-3">
        <SidebarSearch
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          onClear={() => setSearch("")}
        />
      </div>

      <div className="px-0.5 pb-4">
        <FilterBar filter={filter} onChange={setFilter} />
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ConversationList
          isLoading={isLoading}
          showEmptyState={showEmptyState}
          hasConversations={conversations.length > 0}
          filteredConversations={filteredConversations}
          groups={filteredGroups}
          onlineMap={onlineMap}
          unreadMap={unreadMap}
          activeConversationId={selectedConversationId}
          onOpen={openConversation}
          searchQuery={search}
          activeFilter={filter}
        />
      </div>

     {/* Profile Bottom */}
<div
  className="shrink-0 px-2 pb-2"
  style={{ borderTop: "1px solid #ede9fe", paddingTop: "10px" }}
>
  <div className="relative">
    <button
      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-150 cursor-pointer"
      style={{
        background: profileMenuOpen ? "rgba(124,58,237,0.08)" : "transparent",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.06)";
      }}
      onMouseLeave={(e) => {
        if (!profileMenuOpen) {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }
      }}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            className="w-9 h-9 rounded-full object-cover"
            style={{ boxShadow: "0 2px 8px rgba(124,58,237,0.25)" }}
          />
        ) : (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{
              background: "linear-gradient(140deg, #7c3aed 0%, #a78bfa 100%)",
              boxShadow: "0 2px 8px rgba(124,58,237,0.25)",
            }}
          >
            {user?.email?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
        <span
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full"
          style={{ background: "#22c55e", border: "2px solid white" }}
        />
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0 text-left">
        <p
          className="text-[13px] font-bold truncate leading-none"
          style={{ color: "#1e1b4b" }}
        >
          {user?.user_metadata?.full_name || user?.email || "User"}
        </p>
        <p className="text-[10.5px] mt-1 font-semibold flex items-center gap-1" style={{ color: "#22c55e" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
          Active
        </p>
      </div>

      {/* Chevron */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
        style={{ background: profileMenuOpen ? "rgba(124,58,237,0.12)" : "transparent" }}
      >
        <ChevronUp
          size={13}
          style={{
            color: "#7c3aed",
            transform: profileMenuOpen ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 0.2s",
          }}
        />
      </div>
    </button>

    {/* Dropdown */}
    {profileMenuOpen && (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(30, 27, 75, 0.12)" }}
          onClick={() => setProfileMenuOpen(false)}
        />
        <div
          className="absolute bottom-full left-2 right-2 mb-3 rounded-[20px] z-50 overflow-hidden"
          style={{
            background: "#ffffff",
             border: "1px solid rgba(124,58,237,0.14)",
            boxShadow:
              "0 -20px 48px -8px rgba(76,29,149,0.30), 0 8px 24px -4px rgba(76,29,149,0.18), 0 0 0 1px rgba(255,255,255,0.8)",
          }}
        >
          {/* User info header */}
          <div
            className="flex items-center gap-3 px-4 py-3.5"
            style={{
              background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(192,132,252,0.04) 100%)",
              borderBottom: "1px solid #f3f0ff",
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                className="w-11 h-11 rounded-full object-cover shrink-0"
                style={{ boxShadow: "0 4px 12px rgba(124,58,237,0.30)" }}
              />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{
                  background: "linear-gradient(140deg, #7c3aed 0%, #a78bfa 100%)",
                  boxShadow: "0 4px 12px rgba(124,58,237,0.30)",
                }}
              >
                {user?.email?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[13.5px] font-bold truncate" style={{ color: "#1e1b4b" }}>
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-[11px] truncate font-medium" style={{ color: "#a78bfa" }}>
                {user?.email}
              </p>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1.5 px-1.5">
            {/* View Profile — opens ProfileModal */}
            <button
              onClick={() => {
                setProfileMenuOpen(false);
                onOpenProfile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer rounded-xl hover:bg-violet-50"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(124,58,237,0.10)" }}
              >
                <User size={14} style={{ color: "#7c3aed" }} />
              </div>
              <span className="text-[13px] font-semibold" style={{ color: "#1e1b4b" }}>
                View Profile
              </span>
            </button>

            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer rounded-xl hover:bg-violet-50">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(124,58,237,0.10)" }}
              >
                <Settings size={14} style={{ color: "#7c3aed" }} />
              </div>
              <span className="text-[13px] font-semibold" style={{ color: "#1e1b4b" }}>
                Settings
              </span>
            </button>

            <div style={{ borderTop: "1px solid #f3f0ff", margin: "6px 10px" }} />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors cursor-pointer rounded-xl hover:bg-red-50"
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(239,68,68,0.10)" }}
              >
                <LogOut size={14} style={{ color: "#ef4444" }} />
              </div>
              <span className="text-[13px] font-semibold" style={{ color: "#ef4444" }}>
                Sign out
              </span>
            </button>
          </div>
        </div>
      </>
    )}
  </div>
</div>
      
    </div>
  );
}