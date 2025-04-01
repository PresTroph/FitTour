"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const { supabase, session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const updateAvatar = async () => {
      if (session?.user) {
        const currentAvatar = session.user.user_metadata?.avatar_url;
        const googlePicture = session.user.user_metadata?.picture;

        // If user signed in with Google and doesn't have an avatar, set it
        if (!currentAvatar && googlePicture) {
          await supabase.auth.updateUser({
            data: { avatar_url: googlePicture },
          });
        }

        router.replace("/dashboard");
      } else if (!loading) {
        router.replace("/login");
      }
    };

    updateAvatar();
  }, [session, loading, router, supabase]);

  return (
    <main className="min-h-screen flex items-center justify-center text-center">
      <p className="text-lg font-medium">Logging you in...</p>
    </main>
  );
}


