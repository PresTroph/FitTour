"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-blue-100 via-white to-gray-100 px-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-900">
        Welcome to <span className="text-blue-600">FitTour</span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-600 max-w-xl mb-8">
        Personalized, travel-friendly workouts anytime, anywhere. Track your progress. 
        Join live classes. Powered by AI.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/signup")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
        >
          Get Started
        </button>
        <button
          onClick={() => router.push("/login")}
          className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg text-sm hover:bg-gray-100 transition"
        >
          Log In
        </button>
      </div>
    </main>
  );
}
