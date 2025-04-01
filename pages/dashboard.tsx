"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext"; // Adjust this import path as needed
import SubscribeButton from "../components/buttons/SubscribeButton"; // Ensure this file exists or adjust the path

// Example workout type — adjust fields to match your actual schema
type Workout = {
  id: number;
  user_id: string;
  title?: string;
  // add other fields as needed
};

// Extend the default user to handle custom app_metadata for subscription
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

  // Redirect to /login if there's no session once loading is complete
  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }
  }, [session, loading, router]);

  // Fetch workouts for the logged-in user
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

  // Show a loading message while checking session status
  if (loading) {
    return <div>Loading...</div>;
  }

  // Safely check subscription status in app_metadata
  const extendedUser = session?.user as unknown as ExtendedUser;
  const isSubscribed = extendedUser?.app_metadata?.subscription?.status === "active";

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {/* Example greeting */}
      <p>Welcome, {session?.user?.email}</p>

      {/* Workouts List */}
      {workouts.length === 0 ? (
        <p className="mt-4">No workouts yet</p>
      ) : (
        <div className="mt-4 space-y-4">
          {workouts.map((workout) => (
            <div
              key={workout.id}
              className="border p-4 shadow-md rounded-md hover:scale-105 transition-transform"
            >
              <p>Workout ID: {workout.id}</p>
              {workout.title && <p>Title: {workout.title}</p>}
              {/* Add other workout fields here */}
            </div>
          ))}
        </div>
      )}

      {/* Subscription Check */}
      {!isSubscribed ? (
        <div className="mt-4">
          <p className="mb-2">Subscribe to get full access</p>
          <SubscribeButton />
        </div>
      ) : (
        <p className="mt-4">You have full access</p>
      )}
    </div>
  );
}
