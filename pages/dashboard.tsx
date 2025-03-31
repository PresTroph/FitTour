"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import SubscribeButton from "@/components/buttons/SubscribeButton";

interface Workout {
  id: string;
  workout_data: string;
  created_at: string;
}

export default function DashboardPage() {
  const { session, supabase } = useAuth(); // updated to grab supabase from context
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    if (session === undefined) return; // still loading

    if (session === null) {
      router.push("/login");
    }
  }, [session]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!session) return;

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch workouts:", error);
      } else {
        setWorkouts(data);
      }
    };

    fetchWorkouts();
  }, [session, supabase]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Your Saved Workouts</h1>

        {workouts.length === 0 ? (
          <p className="text-gray-500">No workouts yet.</p>
        ) : (
          <ul className="space-y-4">
            {workouts.map((w) => (
              <li key={w.id} className="border rounded p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {w.workout_data}
                </pre>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(w.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* CTA: Subscribe Button */}
        <div className="mt-10 border-t pt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Want unlimited workouts and early feature access?
          </p>
          <SubscribeButton />
        </div>
      </div>
    </main>
  );
}
