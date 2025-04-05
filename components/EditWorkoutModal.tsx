// components/EditWorkoutModal.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Props = {
  workoutId: string; // <-- Use string to match your DB schema
  initialData: string | null;
  onClose: () => void;
  onSave: () => void;
};

export default function EditWorkoutModal({
  workoutId,
  initialData,
  onClose,
  onSave,
}: Props) {
  const [updatedWorkout, setUpdatedWorkout] = useState(initialData ?? "");
  const [saving, setSaving] = useState(false);
  const { supabase } = useAuth();

  const handleUpdate = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("workouts")
      .update({ workout_data: updatedWorkout })
      .eq("id", workoutId); // Now workoutId is a string, matching your DB schema

    if (error) {
      console.error("❌ Failed to update workout:", error);
    } else {
      onSave(); // Refresh workouts
      onClose(); // Close modal
    }

    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white max-w-xl w-full rounded-lg p-6 shadow-lg relative">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-2 right-3 text-lg text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Edit Workout</h2>
        <textarea
          value={updatedWorkout}
          onChange={(e) => setUpdatedWorkout(e.target.value)}
          rows={10}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring text-sm"
          placeholder="Enter workout details"
        />
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="mt-4 w-full bg-black text-white py-2 rounded hover:opacity-90 transition"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}


