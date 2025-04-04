// WorkoutGeneratorModal.tsx

"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WorkoutGeneratorModal({ isOpen, onClose }: Props) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const { supabase, session } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      console.log("🧠 OpenAI response:", data);

      const generatedText =
        data?.data_result ||
        data?.result ||
        data?.choices?.[0]?.message?.content ||
        "";

      if (!generatedText || generatedText.toLowerCase().includes("no workout")) {
        setResponse("Workout generation failed. Try again with more detail.");
        setLoading(false);
        return;
      }

      setResponse(generatedText); // Show it in modal

      const { data: saved, error } = await supabase.from("workouts").insert([
        {
          user_id: session?.user.id,
          workout_data: generatedText,
        },
      ]);

      if (error) {
        console.error("❌ Error saving workout to Supabase:", error);
      } else {
        console.log("✅ Workout saved:", saved);
        // ❌ Do not refresh or close here
      }
    } catch (error) {
      console.error("Error generating workout:", error);
      setResponse("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">AI Workout Generator</h2>
          <button
            onClick={() => {
              if (!loading) {
                onClose();
                router.refresh(); // ✅ Refresh only after user closes manually
              }
            }}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your situation, goals, equipment, etc..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring"
          rows={5}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="mt-4 w-full bg-black text-white py-2 rounded hover:opacity-90 transition"
        >
          {loading ? "Generating..." : "Generate Workout"}
        </button>

        {response && (
          <div className="mt-6 p-4 bg-gray-100 border rounded whitespace-pre-line text-sm max-h-[300px] overflow-y-auto">
            {response}
          </div>
        )}
      </div>
    </div>
  );
}
