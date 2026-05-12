"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex w-1/2 relative items-center justify-center bg-gray-100 dark:bg-gray-950 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-300/40 dark:bg-purple-500/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-blue-300/30 dark:bg-blue-500/20 blur-3xl rounded-full" />
        <div className="absolute w-64 h-64 bg-orange-200/30 dark:bg-orange-500/10 blur-3xl rounded-full" />

        <div className="relative text-center px-10">
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
            Real-time Chat System
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
            Secure messaging, instant updates, modern collaboration platform.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900 px-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl  text-center  font-semibold text-gray-900 dark:text-white">
            Sign in
          </h2>

          <p className="text-gray-500  text-center  dark:text-gray-400 text-sm mt-2">
            Welcome back
          </p>

          {error && (
            <div className="mt-5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Email
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400">
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
            Don’t have an account?{" "}
            <a
              href="/signup"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}