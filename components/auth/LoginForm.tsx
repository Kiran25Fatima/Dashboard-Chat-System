"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email.includes("@")) return setError("Invalid email");
    if (password.length < 6) return setError("Password too short");

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return setError(error.message);

    router.push("/dashboard");
  };

  const inputStyle =
    "w-full pl-11 pr-12 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 outline-none transition-all focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm";

  return (
    <div className="min-h-screen flex bg-white" style={{ colorScheme: "light" }}>
      <div className="hidden md:flex w-1/2 relative items-center justify-center bg-gray-50 overflow-hidden border-r border-gray-100">
        <div className="absolute -top-24 -left-24 w-125 h-125 bg-purple-300/40 blur-3xl rounded-full" />
        <div className="absolute -bottom-28 -right-28 w-100 h-100 bg-blue-300/30 blur-3xl rounded-full" />
        <div className="absolute w-80 h-80 bg-orange-200/20 blur-3xl rounded-full" />

        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        <div className="relative text-center px-10">
          <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-gray-900">
            Real-time Chat System
          </h1>

          <p className="text-gray-500 mt-4 text-sm max-w-xs mx-auto">
            Secure messaging, instant updates, modern collaboration platform.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl text-center font-bold text-gray-900">
            Sign in
          </h2>

          <p className="text-gray-500 text-center text-sm mt-2 font-medium">
            Welcome back to the community
          </p>

          {error && (
            <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="mt-8 space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                Email Address
              </label>

              <div className="relative flex items-center group">
                <svg className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>

                <input
                  type="email"
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputStyle}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                Password
              </label>

              <div className="relative flex items-center group">
                <svg className="absolute left-4 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputStyle}
                />

                <button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute right-4 text-gray-400 hover:text-purple-600 transition-colors"
>
  {showPassword ? (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.05-2.35 2.85-4.32 5.125-5.575M6.18 6.18A9.953 9.953 0 0112 5c5 0 9.27 3.11 11 7a10.06 10.06 0 01-4.21 5.06M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )}
</button>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-lg active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-8 font-medium">
            Don’t have an account?{" "}
            <a href="/signup" className="text-purple-600 font-bold hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}