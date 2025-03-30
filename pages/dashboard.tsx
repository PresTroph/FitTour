import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";


interface Workout {
  id: string;
  workout_data: string;
  created_at: string;
}

export default function DashboardPage() {
  const { session } = useAuth();
  const router = useRouter();

useEffect(() => {
  if (session === null) {
    router.push("/login");
  }
}, [session]);

  const [workouts, setWorkouts] = useState<Workout[]>([]);

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
  }, [session]);

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
                <pre className="text-sm whitespace-pre-wrap">{w.workout_data}</pre>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(w.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
// This page fetches and displays the user's saved workouts from the database.
// It uses the `useAuth` hook to get the current session and fetches workouts from the "workouts" table.
// The workouts are displayed in a list format, with the workout data and creation date.