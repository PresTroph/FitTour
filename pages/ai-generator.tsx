"use client";

import { useState } from "react";
import TopNavbar from "@/components/TopNavbar";

export default function AIGeneratorPage() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

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
      setResponse(data.result ?? "No workout generated.");
    } catch (error) {
      console.error("Error generating workout:", error);
      setResponse("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">AI Workout Generator</h1>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your situation, goals, equipment, etc..."
          className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring"
          rows={6}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="mt-4 w-full bg-black text-white py-2 rounded hover:opacity-90 transition"
        >
          {loading ? "Generating..." : "Generate Workout"}
        </button>

        {response && (
          <div className="mt-6 p-4 bg-white border rounded shadow-sm whitespace-pre-line">
            {response}
          </div>
        )}
      </div>
    </div>
  );
}
