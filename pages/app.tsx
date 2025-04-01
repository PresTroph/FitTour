import { useState, useEffect } from "react";
// Remove this line since we'll get supabase from useAuth()
// import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import WorkoutForm from "../components/forms/WorkoutForm";

export default function AppPage() {
  // Destructure both supabase and session from useAuth()
  const { supabase, session } = useAuth();
  const [result, setResult] = useState<string[]>([]);

  const handleWorkoutGenerated = async (workout: string[]) => {
    if (!session) return;

    const userId = session.user.id;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Use the supabase client from useAuth()
    const { data: existingWorkouts, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startOfMonth.toISOString());

    if (existingWorkouts && existingWorkouts.length >= 3) {
      alert("🚫 You’ve hit your 3 workouts/month limit. Upgrade to Pro for unlimited access.");
      return;
    }

    const { error: insertError } = await supabase.from("workouts").insert({
      user_id: userId,
      workout_data: workout.join("\n"),
    });

    if (!insertError) {
      setResult(workout);
    } else {
      console.error("Insert error:", insertError);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">FitTour Workout Generator</h1>
        <WorkoutForm onGenerate={handleWorkoutGenerated} />
        {result.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Your Workout:</h2>
            <ul className="list-disc pl-5 space-y-1">
              {result.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}

