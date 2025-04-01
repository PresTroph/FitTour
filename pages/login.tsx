"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext"; // adjust the path based on your folder structure

export default function Login() {
  const { supabase, session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if a session exists (only when loading is complete)
    if (!loading && session) {
      router.push("/dashboard");
    }
  }, [session, loading, router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      console.error("Error signing in:", error);
    } else {
      alert("Check your email for the magic link!");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white py-2 rounded">
          Send Magic Link
        </button>
      </form>
    </div>
  );
}
