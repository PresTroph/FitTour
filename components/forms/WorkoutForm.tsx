"use client";

import { useState } from "react";
import {generateWorkout} from "../../lib/workoutEngine";

interface WorkoutFormProps {
  onGenerate: (workout: string[]) => void;
}

export default function WorkoutForm({ onGenerate }: WorkoutFormProps) {
  const [goal, setGoal] = useState("burn");
  const [equipment, setEquipment] = useState("bodyweight");
  const [time, setTime] = useState("15");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder values — actual logic soon
    onGenerate(generateWorkout({ goal, equipment, time }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Goal:</label>
        <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full border rounded p-2">
          <option value="burn">Burn Fat</option>
          <option value="tone">Tone Muscle</option>
          <option value="build">Build Strength</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Equipment:</label>
        <select value={equipment} onChange={(e) => setEquipment(e.target.value)} className="w-full border rounded p-2">
          <option value="bodyweight">Bodyweight Only</option>
          <option value="bands">Resistance Bands</option>
          <option value="dumbbells">Dumbbells</option>
          <option value="hotel">Hotel Gym</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Time (minutes):</label>
        <input
          type="number"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <button type="submit" className="w-full bg-black text-white py-2 rounded hover:opacity-90">
        Generate Workout
      </button>
    </form>
  );
}
