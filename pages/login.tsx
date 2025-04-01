"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { supabase, session, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && session) {
      router.push("/dashboard");
    }
  }, [session, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Invalid credentials. Please try again.");
      console.error("Login error:", error);
    } else {
      setErrorMsg(""); // clear error on success
    }
  };

  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback", // ✅ Replace when live
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      setErrorMsg("Google login failed. Try again.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-sm rounded-xl shadow-md p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-black"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-black"
          required
        />

        {errorMsg && (
          <p className="text-sm text-red-500 text-center">{errorMsg}</p>
        )}

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          Sign In
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
          <hr className="flex-1 border-gray-300" />
          <span>or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-[#4285F4] hover:bg-[#357ae8] text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google"
            className="w-5 h-5 bg-white rounded-full p-[2px]"
          />
          <span>
            Sign in with{" "}
            <span className="font-bold">
      <span style={{ color: "#ffffff" }}>G</span>
      <span style={{ color: "#ffffff" }}>o</span>
      <span style={{ color: "#ffffff" }}>o</span>
      <span style={{ color: "#ffffff" }}>g</span>
      <span style={{ color: "#ffffff" }}>l</span>
      <span style={{ color: "#ffffff" }}>e</span>
            </span>
          </span>
        </button>

        <p className="text-xs text-center text-gray-500 mt-2">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </main>
  );
}
