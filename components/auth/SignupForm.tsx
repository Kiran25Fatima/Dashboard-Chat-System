"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!firstName.trim()) return "First name is required";
    if (!lastName.trim()) return "Last name is required";
    if (!email.trim()) return "Email is required";
    if (!email.includes("@")) return "Enter a valid email address";
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (confirmPassword !== password) return "Passwords do not match";
    return null;
  };

  const handleSignup = async () => {
    setError("");
    const err = validate();
    if (err) return setError(err);

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      return setError(error.message);
    }

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`,
        phone: phone || null,
      });
    }

    setLoading(false);
    router.push("/dashboard");
  };

  const inputContainer = "relative flex items-center";
  const iconStyle =
    "absolute left-4 text-slate-400 w-5 h-5 transition-colors duration-200 group-focus-within:text-purple-500";
  const inputBase =
  "w-full pl-11 pr-4 py-3 rounded-xl bg-white/80 border border-slate-200 text-slate-900 placeholder-slate-400 outline-none transition focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 shadow-sm";

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-50 via-indigo-50/40 to-purple-100/40 font-sans selection:bg-purple-100 selection:text-purple-900">
      
<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-linear-to-br from-slate-900 via-indigo-900 to-purple-900">
  <div className="absolute -top-40 -left-40 w-125 h-125 rounded-full blur-3xl opacity-25 bg-purple-500/30" />
  <div className="absolute -bottom-30 w-105 h-105 rounded-full blur-3xl opacity-20 bg-blue-400/25" />
  <div
    className="absolute inset-0 opacity-[0.03]"
    style={{
      backgroundImage:
        "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
      backgroundSize: "42px 42px",
    }}
  />
  <div
    className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
    style={{
      backgroundImage:
        "url('https://grainy-gradients.vercel.app/noise.svg')",
    }}
  />

  <div className="relative z-10 max-w-xl px-10 text-center">
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-white/5 border border-white/10 backdrop-blur-xl">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      <span className="text-xs font-semibold text-purple-100">
        Secure • Encrypted • Real-time
      </span>
    </div>
    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
      Join a new way of
      <span className="block text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-400">
        communicating
      </span>
    </h1>
    <p className="mt-6 text-purple-100/80 text-base leading-7 font-medium max-w-md mx-auto">
      Create your account in seconds and unlock real-time messaging with
      delivery tracking, typing indicators, and secure communication by default.
    </p>
    <div className="mt-10 space-y-3 text-left max-w-sm mx-auto">

      {[
        "End-to-end encrypted messages",
        "Instant delivery & read receipts",
        "Typing indicators in real-time",
        "Clean, modern chat experience",
      ].map((item) => (
        <div key={item} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-400" />
          <p className="text-sm text-purple-100/80 font-medium">{item}</p>
        </div>
      ))}

    </div>
    <div className="mt-12 flex flex-col items-center gap-3">
      <div className="flex -space-x-2">
        {["bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-emerald-500"].map((c, i) => (
          <div
            key={i}
            className={`w-9 h-9 rounded-full border-2 border-slate-950 ${c}`}
          />
        ))}
      </div>
      <p className="text-xs text-purple-200/70 font-medium">
        Trusted by teams building modern communication tools
      </p>

    </div>

  </div>
</div>
 <div
  className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-hidden"
  style={{
    background:
      "linear-gradient(135deg, #fbfaff 0%, #f7f4ff 45%, #fcfbff 100%)",
  }}
>
        <div
  className="absolute -top-32 -right-30 w-96 h-96 rounded-full blur-3xl opacity-25"
  style={{
    background:
      "radial-gradient(circle, rgba(168,85,247,0.28) 0%, rgba(168,85,247,0) 72%)",
  }}
/>

<div
 className="absolute -bottom-35 -left-25 w-105 h-105 rounded-full blur-3xl opacity-20"
  style={{
    background:
      "radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0) 72%)",
  }}
/>

        <div className="w-full max-w-md relative z-10">
          <div
  className="rounded-3xl p-6 sm:p-8 md:p-10 backdrop-blur-2xl"
  style={{
    background: "rgba(255,255,255,0.75)",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow:
      "0 20px 60px rgba(124,58,237,0.12), 0 40px 100px rgba(124,58,237,0.14)",
  }}
>

            <header className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Create account</h2>
              <p className="text-sm font-medium text-slate-500 mt-2">Start your seamless chatting experience today.</p>
            </header>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 group">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">First name <span className="text-red-500">*</span></label>
                  <div className={inputContainer}>
                    <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input className={inputBase} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Last name <span className="text-red-500">*</span></label>
                  <input className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 hover:border-gray-300 shadow-sm" onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Email address <span className="text-red-500">*</span></label>
                <div className={inputContainer}>
                  <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input type="email" className={inputBase} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Password <span className="text-red-500">*</span></label>
                <div className={inputContainer}>
                  <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input type={showPassword ? "text" : "password"} className={inputBase} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                 <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition"
>
  {showPassword ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.05-2.35 2.85-4.32 5.125-5.575M6.18 6.18A9.953 9.953 0 0112 5c5 0 9.27 3.11 11 7a10.06 10.06 0 01-4.21 5.06M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )}
</button>
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Confirm Password  <span className="text-red-500">*</span></label>
                <div className={inputContainer}>
                  <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input type={showConfirmPassword ? "text" : "password"} className={inputBase} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                  <button
  type="button"
  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition"
>
  {showConfirmPassword ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.05-2.35 2.85-4.32 5.125-5.575M6.18 6.18A9.953 9.953 0 0112 5c5 0 9.27 3.11 11 7a10.06 10.06 0 01-4.21 5.06M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )}
</button>
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Phone (optional)</label>
                <div className={inputContainer}>
                  <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <input className={inputBase} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
                </div>
              </div>
            </div>

            <button
  onClick={handleSignup}
  disabled={loading}
  className="w-full mt-8 py-3.5 text-sm font-bold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
  style={{
    borderRadius: "14px",
    background: "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)",
    boxShadow: "0 6px 20px rgba(124,58,237,0.35)",
    letterSpacing: "0.01em",
  }}
  onMouseEnter={(e) => {
    (e.currentTarget as HTMLButtonElement).style.boxShadow =
      "0 8px 28px rgba(124,58,237,0.45)";
    (e.currentTarget as HTMLButtonElement).style.transform =
      "translateY(-1px)";
  }}
  onMouseLeave={(e) => {
    (e.currentTarget as HTMLButtonElement).style.boxShadow =
      "0 6px 20px rgba(124,58,237,0.35)";
    (e.currentTarget as HTMLButtonElement).style.transform =
      "translateY(0)";
  }}
>
  {loading ? (
    <span className="flex items-center justify-center gap-2">
      <span
        className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
        style={{
          borderColor: "rgba(255,255,255,0.35)",
          borderTopColor: "#ffffff",
        }}
      />
      Creating account…
    </span>
  ) : (
    "Create account"
  )}
</button>

            <p className="text-center text-sm text-slate-500  mt-8">
              Already have an account? <a href="/login" className="text-purple-600 font-bold">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}