// pages/dashboard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import SubscribeButton from "../components/buttons/SubscribeButton";
import TopNavbar from "../components/TopNavbar";
import WorkoutGeneratorModal from "../components/WorkoutGeneratorModal";
import EditWorkoutModal from "../components/EditWorkoutModal";
import AssistantModal from "../components/AssistantModal";
import { toast } from "react-hot-toast";
import type { Database } from "../types/supabase"; // Adjust the path if needed

// Define Workout using your existing Database type
type Workout = Database["public"]["Tables"]["workouts"]["Row"];

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<Workout | null>(null);
  const [showAssistant, setShowAssistant] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [fetchingWorkouts, setFetchingWorkouts] = useState(false);

  const extendedUser = session?.user as unknown as ExtendedUser;
  const isPro = extendedUser?.app_metadata?.subscription?.status === "active";

  const fetchWorkouts = async () => {
    if (!session?.user) return;
    try {
      setFetchingWorkouts(true);
      const { data, error } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Failed to fetch workouts:", error);
        toast.error("Failed to fetch workouts.");
      } else {
        setWorkouts(data || []);
      }
    } catch (err) {
      console.error("❌ Unexpected error while fetching workouts:", err);
      toast.error("An unexpected error occurred while fetching workouts.");
    } finally {
      setFetchingWorkouts(false);
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

    try {
      setDeleteLoading(true);
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", selectedWorkoutId);

      if (error) {
        console.error("❌ Failed to delete workout:", error);
        toast.error("Failed to delete workout. Please try again.");
      } else {
        setWorkouts((prev) => prev.filter((w) => w.id !== selectedWorkoutId));
        toast.success("Workout deleted successfully!");
      }
    } catch (err) {
      console.error("❌ Unexpected error during deletion:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setDeleteLoading(false);
      setSelectedWorkoutId(null);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Free users are limited to 3 workouts
  const hasReachedLimit = !isPro && workouts.length >= 3;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <TopNavbar />
  
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome, {session?.user?.email}</p>
  
        {fetchingWorkouts ? (
          <p>Fetching workouts...</p>
        ) : workouts.length === 0 ? (
          <p className="text-gray-500">No workouts yet</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => {
              const workoutDate = workout.created_at
                ? new Date(workout.created_at).toLocaleDateString()
                : "Unknown";
  
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
                      setEditingWorkout(workout);
                      setShowEditModal(true);
                    }}
                    className="absolute top-2 right-13 text-xs text-blue-500 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWorkoutId(workout.id);
                      setShowDeleteModal(true);
                    }}
                    className="absolute top-2 right-2 text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
  
        {!isPro ? (
          <div className="mt-8">
            <p className="mb-2 text-gray-700">Subscribe to unlock full features</p>
            <SubscribeButton />
             {/* Temporary button to switch to Pro for testing */}
    <button
      onClick={async () => {
        const res = await fetch("/api/test-pro", {
          method: "POST",
        });
        if (res.ok) {
          toast.success("Switched to Pro! Refreshing...");
          // Optionally refresh the page or fetch the updated session.
          // For example, you could re-run fetchWorkouts() or trigger a session refresh.
          fetchWorkouts();
        } else {
          toast.error("Failed to switch to Pro.");
        }
      }}
      className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
    >
      Switch to Pro (Test)
    </button>
          </div>
        ) : (
          <p className="mt-8 text-green-600 font-medium">✅ You have full access</p>
        )}
      </div>
  
      {/* + Generate Workout Button */}
      <button
        onClick={() => setShowGenerator(true)}
        disabled={hasReachedLimit}
        className={`fixed bottom-6 right-6 px-4 py-2 rounded-full shadow-lg text-white transition ${
          hasReachedLimit ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:opacity-90"
        }`}
      >
        + Generate Workout
      </button>
  
      {/* 💬 Chat with AI Assistant */}
      {isPro && (
        <button
          onClick={() => setShowAssistant(true)}
          className="fixed bottom-6 left-6 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg"
        >
          💬 Chat with AI Assistant
        </button>
      )}
  
      {/* Modals */}
      <WorkoutGeneratorModal
        isOpen={showGenerator}
        onClose={() => {
          setShowGenerator(false);
          fetchWorkouts();
        }}
      />
  
      {expandedWorkout && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white max-w-xl w-full rounded-lg p-6 shadow-lg relative">
            <button
              onClick={() => setExpandedWorkout(null)}
              className="absolute top-2 right-3 text-lg text-gray-500 hover:text-black"
              aria-label="Close dialog"
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
  
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Delete Workout?</h2>
            <p className="text-sm mb-6 text-gray-600">
              Are you sure you want to delete this workout?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`px-4 py-2 text-sm rounded text-white ${
                  deleteLoading
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
  
        {showEditModal && editingWorkout && (
        <EditWorkoutModal
          workoutId={editingWorkout.id} // <-- no need for Number(), because id is string
          initialData={editingWorkout.workout_data}
          onClose={() => {
            setShowEditModal(false);
            setEditingWorkout(null);
          }}
          onSave={() => {
            fetchWorkouts();
          }}
        />
      )}

  
      {showAssistant && (
        <AssistantModal
          isOpen={showAssistant}
          onClose={() => setShowAssistant(false)}
        />
      )}
    </div>
  );
  
}
