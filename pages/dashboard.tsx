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
  const isSubscribed = extendedUser?.app_metadata?.subscription?.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar /> {/* ✅ Reusable Top Navbar */}

      <div className="p-4 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>Welcome, {session?.user?.email}</p>

        {workouts.length === 0 ? (
          <p className="mt-4">No workouts yet</p>
        ) : (
          <div className="mt-4 space-y-4">
            {workouts.map((workout) => {
              const workoutDate = workout.created_at
                ? new Date(workout.created_at).toLocaleDateString()
                : "Unknown Date";
              return (
                <div
                  key={workout.id}
                  className="border p-4 shadow-md rounded-md hover:scale-105 transition-transform"
                >
                  <p className="text-sm text-gray-500">
                    Workout Date: {workoutDate}
                  </p>
                  {workout.workout_data && (
                    <div className="mt-2 whitespace-pre-line">
                      {workout.workout_data}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isSubscribed ? (
          <div className="mt-4">
            <p className="mb-2">Subscribe to get full access</p>
            <SubscribeButton />
          </div>
        ) : (
          <p className="mt-4">You have full access</p>
        )}
      </div>
    </div>
  );
}

