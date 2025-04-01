"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopNavbar() {
  const { supabase, session } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.user_metadata?.avatar_url) {
      setAvatarUrl(session.user.user_metadata.avatar_url);
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="flex items-center justify-between bg-white shadow px-4 py-3">
      {/* Logo / Title */}
      <h1
        className="text-xl font-bold text-black cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        FitTour
      </h1>

      <div className="flex items-center gap-4">
        {/* Avatar (Clickable) */}
        <div
          onClick={() => router.push("/profile")}
          className="cursor-pointer"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-700">
              ?
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-black text-white px-3 py-1 rounded hover:opacity-90 transition text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

