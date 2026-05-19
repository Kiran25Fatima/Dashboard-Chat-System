"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

import PrimaryButton from "@/components/ui/PrimaryButton";
import FormError from "@/components/ui/FormError";
import InputField from "@/components/ui/InputField";
import Card from "@/components/ui/Card";

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
          <Card
            className="rounded-3xl p-6 sm:p-8 md:p-10"
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

            <FormError message={error} style={{ marginBottom: "1.5rem", borderRadius: "1rem", background: "#fef2f2", borderColor: "rgba(239,68,68,0.15)", color: "#b91c1c" }} />

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="First name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jane"
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                  inputClassName="text-sm"
                  inputStyle={{
                    color: "#0f172a",
                    fontFamily: "inherit",
                  }}
                />

                <InputField
                  label="Last name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  icon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                  inputClassName="text-sm"
                />
              </div>

              <InputField
                label="Email address"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                icon={
                  <svg
                    className="w-4 h-4"
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
                    className="w-4 h-4"
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
              />

              <InputField
                label="Confirm Password"
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon={
                  <svg
                    className="w-4 h-4"
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-slate-400 hover:text-purple-600 transition"
                  >
                    {showConfirmPassword ? (
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
              />

              <InputField
                label="Phone (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
                icon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                }
                inputClassName="text-sm"
              />
            </div>

            <PrimaryButton onClick={handleSignup} disabled={loading} loading={loading} loadingLabel="Creating account…">
              Create account
            </PrimaryButton>

            <p className="text-center text-sm text-slate-500  mt-8">
              Already have an account? <a href="/login" className="text-purple-600 font-bold">Sign in</a>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}