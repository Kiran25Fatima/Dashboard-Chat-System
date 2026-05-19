"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PrimaryButton from "@/components/ui/PrimaryButton";
import FormError from "@/components/ui/FormError";
import InputField from "@/components/ui/InputField";
import Card from "@/components/ui/Card";
import AuthSplitLayout from "@/components/layout/AuthSplitLayout";

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

  const heroContent = (
    <div className="hidden md:flex w-full h-full overflow-hidden">
      <Image
        src="/pic.jpg"
        alt="Login background"
        fill
        priority
        className="object-cover scale-[1.03]"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.45) 0%, rgba(46,16,101,0.72) 55%, rgba(17,24,39,0.88) 100%)",
        }}
      />
      <div
        className="absolute -top-40 -left-40 w-125 h-125 rounded-full blur-3xl opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.65) 0%, rgba(168,85,247,0) 70%)",
        }}
      />
      <div
        className="absolute -bottom-45 -right-30 w-105 h-105 rounded-full blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.8) 0%, rgba(124,58,237,0) 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full w-full px-6 lg:px-14 py-8 lg:py-14">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center backdrop-blur-xl"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow:
                "0 10px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12)",
            }}
          >
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>

          <div>
            <h1
              className="text-white text-2xl font-black tracking-tight"
              style={{ letterSpacing: "-0.04em" }}
            >
              Conversa
            </h1>
            <p className="text-purple-200 text-sm font-medium">
              Real-time communication platform
            </p>
          </div>
        </div>

        <div className="max-w-xl w-full">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-purple-100 font-semibold">
              Trusted by modern teams
            </span>
          </div>

          <h2
            className="text-4xl sm:text-5xl lg:text-[56px] leading-[1.1] font-black text-white"
            style={{ letterSpacing: "-0.06em" }}
          >
            Messaging that feels
            <span className="block text-purple-300">fast, elegant, alive.</span>
          </h2>

          <p className="mt-7 text-[17px] leading-8 text-purple-100/90 max-w-lg font-medium">
            Collaborate instantly with secure messaging, live presence,
            delivery tracking, typing indicators, and a beautifully crafted
            experience built for modern workflows.
          </p>

          <div className="mt-10 flex gap-8">
            {[
              ["99.9%", "Uptime"],
              ["Realtime", "Sync"],
              ["Secure", "Encrypted"],
            ].map(([title, sub]) => (
              <div key={title}>
                <h3 className="text-white text-2xl font-black">{title}</h3>
                <p className="text-purple-200 text-sm font-medium mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="w-full max-w-md rounded-3xl p-5 backdrop-blur-2xl"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-emerald-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm">Everything synced instantly</h4>
              <p className="text-purple-100/80 text-sm leading-6 mt-1">
                Messages, delivery status, typing indicators, and unread
                updates happen in real time across all devices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AuthSplitLayout hero={heroContent}>
      <div
        className="absolute -top-32 right-30 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.28) 0%, rgba(168,85,247,0) 72%)",
        }}
      />

      <div
        className="absolute -bottom-35 -left-25 w-105 h-105 rounded-full blur-3xl opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.25) 0%, rgba(124,58,237,0) 72%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.12) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full rounded-3xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-2">
              Sign in to continue to Conversa
            </p>
          </div>

          <FormError message={error} />

          <div className="space-y-5">
            <InputField
              label="Email Address"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={
                <svg
                  style={{ color: "#c4b5fd", width: "18px", height: "18px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              }
              inputClassName="text-sm"
              inputStyle={{
                background: "rgba(248,245,255,0.8)",
                border: "1px solid rgba(139,92,246,0.14)",
                color: "#1e0a3c",
                fontFamily: "inherit",
              }}
              inputProps={{
                onFocus: (e) => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.45)";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(139,92,246,0.07)";
                  e.currentTarget.style.background = "#ffffff";
                },
                onBlur: (e) => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.14)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(248,245,255,0.8)";
                },
              }}
            />

            <InputField
              label="Password"
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={
                <svg
                  style={{ color: "#c4b5fd", width: "18px", height: "18px" }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              }
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-purple-600 transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7 1.05-2.35 2.85-4.32 5.125-5.575M6.18 6.18A9.953 9.953 0 0112 5c5 0 9.27 3.11 11 7a10.06 10.06 0 01-4.21 5.06M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              }
              inputClassName="text-sm"
              inputStyle={{
                background: "rgba(248,245,255,0.8)",
                border: "1px solid rgba(139,92,246,0.14)",
                color: "#1e0a3c",
                fontFamily: "inherit",
              }}
              inputProps={{
                onFocus: (e) => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.45)";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(139,92,246,0.07)";
                  e.currentTarget.style.background = "#ffffff";
                },
                onBlur: (e) => {
                  e.currentTarget.style.borderColor = "rgba(139,92,246,0.14)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = "rgba(248,245,255,0.8)";
                },
              }}
            />
          </div>

          <PrimaryButton onClick={handleLogin} disabled={loading} loading={loading} loadingLabel="Signing in…">
            Sign in
          </PrimaryButton>

          <p className="text-center text-sm mt-7" style={{ color: "#9585b8" }}>
            Don't have an account?{" "}
            <a
              href="/signup"
              className="font-bold transition-colors duration-150"
              style={{ color: "#7c3aed" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#5b21b6")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#7c3aed")}
            >
              Create one
            </a>
          </p>
        </Card>
      </div>
    </AuthSplitLayout>
  );
}