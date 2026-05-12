"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email.includes("@")) return "Invalid email";
    if (password.length < 6) return "Password too short";
    return null;
  };

  const handleSignup = async () => {
    setError("");

    const err = validate();
    if (err) return setError(err);

    setLoading(true);

    const { error } = await supabase.auth.signUp({
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
        <div className="-top-24 -left-24 w-96 h-96 bg-purple-300/40 dark:bg-purple-500/20 blur-3xl rounded-full absolute" />
        <div className="-bottom-28 -right-28 w-80 h-80 bg-blue-300/30 dark:bg-blue-500/20 blur-3xl rounded-full absolute" />
        <div className="w-64 h-64 bg-purple-200/20 dark:bg-purple-500/10 blur-3xl rounded-full absolute" />

        <div className="relative text-center px-10">
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
            Join Real-time Chat
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
            Create your account and start messaging instantly with secure real-time updates.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-gray-900 px-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl text-center font-semibold text-gray-900 dark:text-white">
            Create account
          </h2>

          <p className="text-gray-500  text-center  dark:text-gray-400 text-sm mt-2">
            Start your journey
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
            onClick={handleSignup}
            disabled={loading}
            className="w-full mt-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{" "}
            <a href="/login" className="text-purple-600 dark:text-purple-400 hover:underline">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}