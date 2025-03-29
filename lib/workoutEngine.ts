export interface WorkoutInput {
    goal: string;
    equipment: string;
    time: string;
  }
  
  export function generateWorkout({ goal, equipment, time }: WorkoutInput): string[] {
    const mins = parseInt(time);
    const exercises: string[] = [];
  
    if (equipment === "bodyweight") {
      if (goal === "burn") {
        exercises.push("Jumping Jacks – 2 min", "High Knees – 1 min", "Burpees – 10 reps");
      } else if (goal === "tone") {
        exercises.push("Plank – 1 min", "Lunges – 3x12", "Pushups – 3x10");
      } else {
        exercises.push("Pike Pushups – 3x8", "Bulgarian Split Squats – 3x10", "Slow Squats – 3x12");
      }
    }
  
    if (equipment === "bands") {
      exercises.push("Band Rows – 3x15", "Band Squats – 3x12", "Overhead Press – 3x10");
    }
  
    if (equipment === "dumbbells") {
      exercises.push("Dumbbell Deadlifts – 3x10", "Chest Press – 3x12", "Shoulder Press – 3x10");
    }
  
    if (equipment === "hotel") {
      exercises.push("Treadmill Run – 5 mins", "Cable Rows – 3x15", "Leg Press – 3x10");
    }
  
    exercises.push(`Stretch & cool down – 3 mins`);
    exercises.push(`Total time: ~${mins} minutes`);
  
    return exercises.slice(0, 4); // Limit for now
  }
  