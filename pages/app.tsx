import { useState } from "react";
import WorkoutForm from "../components/forms/WorkoutForm";

export default function AppPage() {
  const [result, setResult] = useState<string[]>([]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">FitTour Workout Generator</h1>
        <WorkoutForm onGenerate={setResult} />
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
