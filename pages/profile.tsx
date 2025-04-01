"use client";

import AvatarUploader from "@/components/AvatarUploader";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { session } = useAuth();

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Please log in to view your profile.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <p className="mb-4 text-sm text-gray-500">
        Logged in as: <strong>{session.user.email}</strong>
      </p>
      <AvatarUploader />
    </main>
  );
}
