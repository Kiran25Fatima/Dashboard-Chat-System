"use client";

import { useEffect, useState } from "react";
import { X, Camera } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";

export default function ProfileModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useLockBodyScroll();

  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, email, avatar_url")
        .eq("id", user.id)
        .single();

      if (data) {
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setEmail(data.email || user.email || "");
        setAvatarUrl(data.avatar_url || null);
      }
    };
    loadProfile();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error(uploadError);
      setIsUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setAvatarUrl(publicUrl);
    setIsUploadingAvatar(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaved(false);

    await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        phone: phone || null,
      })
      .eq("id", user.id);

    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const initials = firstName
    ? firstName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(30, 27, 75, 0.45)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[28px] overflow-hidden flex flex-col"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(124,58,237,0.10)",
          boxShadow:
            "0 32px 64px -12px rgba(76,29,149,0.28), 0 12px 24px -8px rgba(76,29,149,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div
          className="relative px-6 pt-5 pb-14"
          style={{
            background: "linear-gradient(135deg, #6d28d9 0%, #9333ea 55%, #c084fc 100%)",
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-white/90">
              Your Profile
            </h2>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full transition cursor-pointer"
              style={{ background: "rgba(255,255,255,0.16)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.28)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.16)")}
            >
              <X size={14} color="white" />
            </button>
          </div>
        </div>

        {/* Avatar  */}
        <div className="flex flex-col items-center" style={{ marginTop: "-56px" }}>
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover"
                style={{
                  border: "4px solid #ffffff",
                  boxShadow: "0 12px 28px rgba(76,29,149,0.35)",
                }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{
                  background: "linear-gradient(140deg, #7c3aed 0%, #a78bfa 100%)",
                  border: "4px solid #ffffff",
                  boxShadow: "0 12px 28px rgba(76,29,149,0.35)",
                }}
              >
                {initials}
              </div>
            )}

            <label
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform"
              style={{
                background: "#7c3aed",
                border: "3px solid white",
                boxShadow: "0 4px 10px rgba(124,58,237,0.45)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLLabelElement).style.transform = "scale(1.08)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLLabelElement).style.transform = "scale(1)")}
            >
              {isUploadingAvatar ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={13} color="white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>

          <p className="mt-4 text-[15px] font-bold tracking-tight" style={{ color: "#1e1b4b" }}>
            {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Add your name"}
          </p>
          <p className="text-[12px] mt-0.5 font-medium" style={{ color: "#a78bfa" }}>
            {email}
          </p>
        </div>

        {/* Divider */}
        <div className="px-6 mt-5">
          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, #ede9fe, transparent)" }} />
        </div>

        {/* Form */}
        <div className="px-6 pt-5 pb-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* First name */}
            <div>
              <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-wide" style={{ color: "#6d28d9" }}>
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-2xl text-[13.5px] outline-none transition-all"
                style={{
                  background: "#f8f7fd",
                  border: "1.5px solid #ede9fe",
                  color: "#1e1b4b",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7c3aed";
                  e.target.style.background = "#ffffff";
                  e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ede9fe";
                  e.target.style.background = "#f8f7fd";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="First name"
              />
            </div>

            {/* Last name */}
            <div>
              <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-wide" style={{ color: "#6d28d9" }}>
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-2xl text-[13.5px] outline-none transition-all"
                style={{
                  background: "#f8f7fd",
                  border: "1.5px solid #ede9fe",
                  color: "#1e1b4b",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#7c3aed";
                  e.target.style.background = "#ffffff";
                  e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.10)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#ede9fe";
                  e.target.style.background = "#f8f7fd";
                  e.target.style.boxShadow = "none";
                }}
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Email — readonly */}
          <div>
            <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-wide" style={{ color: "#6d28d9" }}>
              Email
            </label>
            <div className="relative">
              <input
                value={email}
                readOnly
                className="w-full h-11 px-3.5 rounded-2xl text-[13.5px] outline-none"
                style={{
                  background: "#f8f7fc",
                  border: "1.5px solid #ede9fe",
                  color: "#9d8ec7",
                  fontFamily: "inherit",
                  cursor: "not-allowed",
                }}
              />
              <span
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: "#ede9fe", color: "#7c3aed" }}
              >
                Locked
              </span>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-[11px] font-bold mb-1.5 block uppercase tracking-wide" style={{ color: "#6d28d9" }}>
              Phone <span className="font-medium" style={{ color: "#c4b5fd" }}>(optional)</span>
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-11 px-3.5 rounded-2xl text-[13.5px] outline-none transition-all"
              style={{
                background: "#f8f7fd",
                border: "1.5px solid #ede9fe",
                color: "#1e1b4b",
                fontFamily: "inherit",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#7c3aed";
                e.target.style.background = "#ffffff";
                e.target.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.10)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#ede9fe";
                e.target.style.background = "#f8f7fd";
                e.target.style.boxShadow = "none";
              }}
              placeholder="+1 555 000 0000"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 rounded-2xl text-white text-[13.5px] font-bold transition-all cursor-pointer mt-3 flex items-center justify-center gap-2"
            style={{
              background: saved
                ? "#16a34a"
                : "linear-gradient(135deg, #6d28d9 0%, #9333ea 100%)",
              boxShadow: saved
                ? "0 8px 20px rgba(22,163,74,0.30)"
                : "0 8px 20px rgba(124,58,237,0.35)",
              opacity: isSaving ? 0.75 : 1,
              transform: "translateY(0)",
            }}
            onMouseEnter={(e) => {
              if (!isSaving) (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {saved ? "✓ Saved" : isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}