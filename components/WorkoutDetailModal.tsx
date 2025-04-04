// components/WorkoutDetailModal.tsx
"use client";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  workoutText: string;
  date?: string;
};

export default function WorkoutDetailModal({ isOpen, onClose, workoutText, date }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Workout Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black text-lg">✕</button>
        </div>

        {date && <p className="text-sm text-gray-500 mb-2">Date: {date}</p>}

        <div className="whitespace-pre-line text-sm text-gray-800">
          {workoutText}
        </div>
      </div>
    </div>
  );
}
