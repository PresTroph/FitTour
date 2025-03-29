import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import WorkoutForm from "../components/forms/WorkoutForm";

export default function AppPage() {
  const [result, setResult] = useState<string[]>([]);
  const { session } = useAuth(); // ✅ Only once

  console.log("Current session:", session);

  const handleWorkoutGenerated = async (workout: string[]) => {
    setResult(workout);

    if (session) {
      await supabase.from("workouts").insert({
        user_id: session.user.id,
        workout_data: workout.join("\n"),
      });
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

