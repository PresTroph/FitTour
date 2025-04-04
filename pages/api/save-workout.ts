// pages/api/save-workout.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const supabase = createServerSupabaseClient({ req, res });
  const { data: session } = await supabase.auth.getUser();
  const { workout_data } = req.body;

  if (!session?.user || !workout_data) {
    return res.status(400).json({ error: "Missing user or workout data" });
  }

  const { error } = await supabase.from("workouts").insert({
    user_id: session.user.id,
    workout_data,
  });

  if (error) {
    console.error("Error saving workout:", error);
    return res.status(500).json({ error: "Failed to save workout" });
  }

  return res.status(200).json({ message: "Workout saved" });
}
