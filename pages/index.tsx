// pages/index.tsx

"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
      <div className="text-center max-w-xl space-y-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
          Welcome to <span className="text-blue-600">FitTour</span>
        </h1>

        <p className="text-gray-600 text-lg sm:text-xl">
          Your fitness companion — anywhere, anytime. Generate personalized
          workouts, track progress, and connect with the FitTour community.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/signup")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Get Started
          </button>

          <button
            onClick={() => router.push("/login")}
            className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Log In
          </button>
        </div>
      </div>
    </main>
  );
}
