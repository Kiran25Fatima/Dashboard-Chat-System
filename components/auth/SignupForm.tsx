"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validate = () => {
    if (!email.includes("@")) return "Invalid email"
    if (password.length < 6) return "Password too short"
    return null
  }
  const handleSignup = async () => {
    setError("")

    const err = validate()
    if (err) return setError(err)

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) return setError(error.message)

    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">

        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Create Account
        </h1>

        <p className="text-gray-500 text-center text-sm mt-2">
          Start your journey
        </p>


        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm p-2 rounded-lg">
            {error}
          </div>
        )}

  
        <div className="mt-6">
          <label className="text-sm text-gray-600">Email</label>
          <input
            className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:border-orange-500 outline-none"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mt-4">
          <label className="text-sm text-gray-600">Password</label>
          <input
            className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:border-orange-500 outline-none"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-orange-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}