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
    "absolute left-4 text-gray-400 w-5 h-5 transition-colors duration-200 group-focus-within:text-purple-500";
  const inputBase =
    "w-full pl-11 pr-12 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 hover:border-gray-300 shadow-sm";

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-50 via-indigo-50/40 to-purple-100/40 selection:bg-purple-100 selection:text-purple-900">
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden bg-linear-to-br from-white via-slate-50 to-indigo-50 border-r border-gray-100">
        <div className="absolute w-125 h-125 bg-purple-300/40 blur-[140px] rounded-full -top-10 -left-10 animate-pulse" />
        <div className="absolute w-100 h-100 bg-blue-300/30 blur-[120px] rounded-full bottom-0 right-0 animate-pulse" />
        <div className="absolute w-80 h-80 bg-pink-200/30 blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        <div className="z-10 max-w-lg text-center px-10">
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-linear-to-tr from-purple-600 to-indigo-500 shadow-[0_20px_50px_rgba(124,58,237,0.3)]">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>

          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
            The future of <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-blue-600">
              conversation.
            </span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed font-medium max-w-sm mx-auto">
            Experience fast messaging with end-to-end security and a beautiful interface built for modern teams.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative bg-linear-to-br from-white via-purple-50/30 to-blue-50/40">
        <div className="absolute top-1/4 right-10 w-64 h-64 bg-purple-200/30 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-10 w-48 h-48 bg-blue-200/30 blur-3xl rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-4xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] border border-white p-8 md:p-10 backdrop-blur-sm">

            <header className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create account</h2>
              <p className="text-slate-500 mt-2 font-medium">Start your seamless chatting experience today.</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First name <span className="text-red-500">*</span></label>
                  <div className={inputContainer}>
                    <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <input className={inputBase} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last name <span className="text-red-500">*</span></label>
                  <input className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 outline-none transition-all duration-300 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 hover:border-gray-300 shadow-sm" onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email address <span className="text-red-500">*</span></label>
                <div className={inputContainer}>
                  <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input type="email" className={inputBase} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password <span className="text-red-500">*</span></label>
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Password  <span className="text-red-500">*</span></label>
                <div className={inputContainer}>
                  <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input type={showConfirmPassword ? "text" : "password"} className={inputBase} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                  <button
  type="button"
  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition"
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone (optional)</label>
                <div className={inputContainer}>
                  <svg className={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <input className={inputBase} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" />
                </div>
              </div>
            </div>

            <button onClick={handleSignup} disabled={loading} className="w-full mt-8 py-4 rounded-xl bg-purple-600 text-white font-bold">
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-center text-sm text-slate-500 mt-8">
              Already have an account? <a href="/login" className="text-purple-600 font-bold">Sign in</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}