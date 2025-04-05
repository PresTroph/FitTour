// pages/api/test-pro.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1) Create a server client with anon key to get the session
  const supabaseServer = createServerSupabaseClient<Database>({ req, res });
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();

  if (!session?.user) {
    console.error("No user session found.");
    return res.status(401).json({ error: "Unauthorized" });
  }

  console.log("User session found, user id:", session.user.id);

  // 2) Create an admin client using the service role key
  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  console.log("Using admin client with URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  // Optional: log the key length (do not log the full key)
  console.log("Service role key length:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length);

  // 3) Attempt to update the user's app_metadata to mark them as Pro
  const { error } = await supabaseAdmin.auth.admin.updateUserById(session.user.id, {
    app_metadata: { subscription: { status: "active" } },
  });

  if (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: error.message, code: error.code });
  }

  console.log("User updated successfully to Pro.");
  return res.status(200).json({ message: "User updated to Pro" });
}
