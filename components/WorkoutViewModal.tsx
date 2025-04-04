"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  workoutId: number;
  workoutText: string;
};

export default function WorkoutViewModal({
  isOpen,
  onClose,
  workoutText,
  workoutId,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(workoutText);
  const [saving, setSaving] = useState(false);

  const { supabase } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);

    const { error } = await supabase
      .from("workouts")
      .update({ workout_data: text })
      .eq("id", workoutId);

    setSaving(false);

    if (error) {
      alert("Failed to update workout.");
      console.error(error);
    } else {
      router.refresh(); // refresh dashboard
      onClose(); // close modal
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {editing ? "Edit Workout" : "Workout Details"}
          </h2>
          <button
            onClick={() => {
              if (!saving) onClose();
            }}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        {editing ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring"
              rows={10}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 w-full bg-black text-white py-2 rounded hover:opacity-90 transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </>
        ) : (
          <>
            <div className="whitespace-pre-line text-sm text-gray-800">
              {text}
            </div>
            <button
              onClick={() => setEditing(true)}
              className="mt-4 text-sm text-blue-600 hover:underline"
            >
              Edit Workout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
