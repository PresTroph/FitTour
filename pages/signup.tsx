"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function SignUp() {
  const router = useRouter();
  const { supabase, session, loading } = useAuth();

  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!loading && session) {
      router.push("/dashboard");
    }
  }, [session, loading, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      [signupMethod]: signupMethod === "email" ? email : phone,
      password,
    });

    if (error) {
      setErrorMsg(error.message || "Signup failed. Please try again.");
    } else {
      setSuccessMsg("Account created! Check your email or phone to confirm.");
    }
  };

  const handleOAuthSignIn = async (provider: "google") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: "http://localhost:3000/auth/callback", // ⚠️ Change this when deploying
      },
    });

    if (error) {
      console.error("OAuth Sign-In Error:", error.message);
      setErrorMsg("Social sign-in failed. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSignUp}
        className="bg-white w-full max-w-sm rounded-xl shadow-md p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center text-gray-900">
          Create Account
        </h1>

        {/* Sign up method toggle */}
        <div className="flex justify-center gap-4 mb-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="signupMethod"
              value="email"
              checked={signupMethod === "email"}
              onChange={() => setSignupMethod("email")}
            />
            Email
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="signupMethod"
              value="phone"
              checked={signupMethod === "phone"}
              onChange={() => setSignupMethod("phone")}
            />
            Phone
          </label>
        </div>

        {/* Email or phone input */}
        <input
          type={signupMethod === "email" ? "email" : "tel"}
          placeholder={
            signupMethod === "email" ? "Email address" : "Phone number"
          }
          value={signupMethod === "email" ? email : phone}
          onChange={(e) =>
            signupMethod === "email"
              ? setEmail(e.target.value)
              : setPhone(e.target.value)
          }
          className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-black"
          required
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-black pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring focus:border-black pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-500"
            tabIndex={-1}
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>

        {/* Error/success message */}
        {errorMsg && (
          <p className="text-sm text-red-500 text-center">{errorMsg}</p>
        )}
        {successMsg && (
          <p className="text-sm text-green-600 text-center">{successMsg}</p>
        )}

        {/* Sign up button */}
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 transition"
        >
          Sign Up
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center gap-2 my-2 text-sm text-gray-400">
          <hr className="flex-grow border-gray-300" />
          or
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Google button */}
        <button
  onClick={() => handleOAuthSignIn("google")}
  type="button"
  className="w-full flex items-center justify-center gap-3 bg-[#4285F4] hover:bg-[#3367D6] text-white font-medium py-2 rounded-lg shadow-sm transition"
>
  <img
    src="https://developers.google.com/identity/images/g-logo.png"
    alt="Google logo"
    className="w-5 h-5 bg-white rounded-full p-[2px]"
  />
  <span className="text-sm font-medium">
    Sign up with{" "}
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

        {/* Login link */}
        <p className="text-xs text-center text-gray-500 mt-2">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </main>
  );
}


