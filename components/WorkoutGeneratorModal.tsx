// WorkoutGeneratorModal.tsx

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const TAGS = [
  "Fat Loss",
  "Muscle Gain",
  "No Equipment",
  "Beginner",
  "Full Body",
  "HIIT",
  "Home Workout",
  "Travel Friendly",
  "Bodyweight Only",
];

export default function WorkoutGeneratorModal({ isOpen, onClose }: Props) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [memoryPrompt, setMemoryPrompt] = useState("");

  const { supabase, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchMemory = async () => {
      if (!session?.user.id) return;

      const { data, error } = await supabase
        .from("workouts")
        .select("workout_data")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Failed to fetch past workouts:", error);
        return;
      }

      const previous = data?.map((w: { workout_data: any; }) => w.workout_data).join("\n\n");
      setMemoryPrompt(previous || "");
    };

    if (isOpen) fetchMemory();
  }, [isOpen, supabase, session?.user.id]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setResponse("");

    try {
      const finalPrompt = memoryPrompt
        ? `${memoryPrompt}\n\nUser Request: ${input}`
        : input;

      const res = await fetch("/api/generate-workout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: finalPrompt }),
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

      setResponse(generatedText);

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
      }
    } catch (error) {
      console.error("Error generating workout:", error);
      setResponse("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleTagClick = (tag: string) => {
    const cleaned = tag.trim();
    if (!input.includes(cleaned)) {
      setInput((prev) =>
        prev.length > 0 ? `${prev.trim()}, ${cleaned}` : cleaned
      );
    }
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
                router.refresh();
              }
            }}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        {/* 🏷️ Quick Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full transition"
            >
              {tag}
            </button>
          ))}
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

