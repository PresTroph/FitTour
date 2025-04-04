"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AvatarUploader from "@/components/AvatarUploader";
import TopNavbar from "@/components/TopNavbar";

export default function SettingsPage() {
  const { session, supabase, loading } = useAuth();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }
  }, [loading, session, router]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      return setMessage("❌ Passwords do not match.");
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error(error);
      setMessage("❌ Failed to update password.");
    } else {
      setMessage("✅ Password updated successfully.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />

      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Account Settings</h1>

        <p className="text-gray-700 mb-4">
          <strong>Logged in as:</strong>{" "}
          {session?.user?.email || session?.user?.phone}
        </p>

        {/* Avatar Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Profile Picture</h2>
          <AvatarUploader />
        </section>

        {/* Password Update Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Update Password</h2>
          <form onSubmit={handlePasswordUpdate} className="space-y-3">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg text-sm"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded hover:opacity-90 transition text-sm"
            >
              Update Password
            </button>
            {message && <p className="text-sm text-center mt-2">{message}</p>}
          </form>
        </section>

        {/* Subscription Link */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Subscription</h2>
          <p className="text-gray-600 mb-2">
            Need to update or cancel your subscription?
          </p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-gray-400 cursor-not-allowed text-sm"
            title="Coming soon"
            >
            Manage via Stripe (Coming Soon)
          </a>

        </section>
      </main>
    </div>
  );
}

