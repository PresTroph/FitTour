"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import SubscribeButton from "../components/buttons/SubscribeButton";
import TopNavbar from "../components/TopNavbar";

type Workout = {
  workout_data: any;
  id: number;
  user_id: string;
  title?: string;
  created_at?: string;
};

type ExtendedUser = {
  app_metadata?: {
    subscription?: {
      status?: string;
    };
  };
};

export default function Dashboard() {
  const { supabase, session, loading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }
  }, [session, loading, router]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", session.user.id);

      if (error) {
        console.error("Failed to fetch workouts:", error);
      } else if (data) {
        setWorkouts(data);
      }
    };

    if (session) {
      fetchWorkouts();
    }
  }, [session, supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const extendedUser = session?.user as unknown as ExtendedUser;
  const isSubscribed =
    extendedUser?.app_metadata?.subscription?.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />

      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Welcome, {session?.user?.email}
        </p>

        {workouts.length === 0 ? (
          <p className="text-gray-500">No workouts yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => {
              const workoutDate = workout.created_at
                ? new Date(workout.created_at).toLocaleDateString()
                : "Unknown Date";

              return (
                <div
                  key={workout.id}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-md border transition"
                >
                  <p className="text-xs text-gray-500 mb-1">
                    {workoutDate}
                  </p>
                  {workout.workout_data && (
                    <pre className="whitespace-pre-line text-sm text-gray-800">
                      {workout.workout_data}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isSubscribed ? (
          <div className="mt-8">
            <p className="mb-2 text-gray-700">
              Subscribe to get full access
            </p>
            <SubscribeButton />
          </div>
        ) : (
          <p className="mt-8 text-green-600 font-medium">
            You have full access
          </p>
        )}
      </div>
    </div>
  );
}
