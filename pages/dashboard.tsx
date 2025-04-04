"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import SubscribeButton from "../components/buttons/SubscribeButton";
import TopNavbar from "../components/TopNavbar";
import WorkoutGeneratorModal from "../components/WorkoutGeneratorModal";

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
  const [showGenerator, setShowGenerator] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState<Workout | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | null>(null);

  const fetchWorkouts = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Failed to fetch workouts:", error);
    } else {
      setWorkouts(data || []);
    }
  };

  useEffect(() => {
    if (!loading && !session) router.push("/login");
  }, [session, loading, router]);

  useEffect(() => {
    if (session) fetchWorkouts();
  }, [session]);

  const handleDelete = async () => {
    if (!selectedWorkoutId) return;

    const { error } = await supabase
      .from("workouts")
      .delete()
      .eq("id", selectedWorkoutId);

    if (error) {
      console.error("❌ Failed to delete workout:", error);
    } else {
      setWorkouts((prev) => prev.filter((w) => w.id !== selectedWorkoutId));
    }

    setShowDeleteModal(false);
    setSelectedWorkoutId(null);
  };

  const extendedUser = session?.user as unknown as ExtendedUser;
  const isSubscribed = extendedUser?.app_metadata?.subscription?.status === "active";

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <TopNavbar />

      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome, {session?.user?.email}</p>

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
                  className="bg-white p-4 rounded-xl shadow hover:shadow-md border transition relative"
                >
                  <p className="text-xs text-gray-500 mb-1">{workoutDate}</p>

                  <pre
                    className="whitespace-pre-line text-sm text-gray-800 cursor-pointer line-clamp-5"
                    onClick={() => setExpandedWorkout(workout)}
                  >
                    {workout.workout_data}
                  </pre>

                  <button
                    onClick={() => {
                      setSelectedWorkoutId(workout.id);
                      setShowDeleteModal(true);
                    }}
                    className="absolute top-2 right-2 text-red-500 text-xs hover:underline"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!isSubscribed ? (
          <div className="mt-8">
            <p className="mb-2 text-gray-700">Subscribe to get full access</p>
            <SubscribeButton />
          </div>
        ) : (
          <p className="mt-8 text-green-600 font-medium">You have full access</p>
        )}
      </div>

      {/* Floating Workout Generator Button */}
      <button
        onClick={() => setShowGenerator(true)}
        className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded-full shadow-lg hover:opacity-90 transition"
      >
        + Generate Workout
      </button>

      <WorkoutGeneratorModal
        isOpen={showGenerator}
        onClose={() => {
          setShowGenerator(false);
          fetchWorkouts();
        }}
      />

      {/* Workout View Modal */}
      {expandedWorkout && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white max-w-xl w-full rounded-lg p-6 shadow-lg relative">
            <button
              onClick={() => setExpandedWorkout(null)}
              className="absolute top-2 right-3 text-lg text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-2">Workout Details</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-800 max-h-[400px] overflow-y-auto">
              {expandedWorkout.workout_data}
            </pre>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Delete Workout?</h2>
            <p className="text-sm mb-6 text-gray-600">
              Are you sure you want to delete this workout?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
