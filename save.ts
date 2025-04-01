// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../context/AuthContext"; // Adjust this import path as needed
// import SubscribeButton from "../components/buttons/SubscribeButton"; // Ensure this file exists or adjust the path

// // Example workout type — adjust fields to match your actual schema
// type Workout = {
//   workout_data: any;
//   id: number;
//   user_id: string;
//   title?: string;
//   created_at?: string;
//   // add other fields as needed
// };

// // Extend the default user to handle custom app_metadata for subscription
// type ExtendedUser = {
//   app_metadata?: {
//     subscription?: {
//       status?: string;
//     };
//   };
// };

// export default function Dashboard() {
//   const { supabase, session, loading } = useAuth();
//   const router = useRouter();
//   const [workouts, setWorkouts] = useState<Workout[]>([]);

//   // Redirect to /login if there's no session once loading is complete
//   useEffect(() => {
//     if (!loading && !session) {
//       router.push("/login");
//     }
//   }, [session, loading, router]);

//   // Fetch workouts for the logged-in user
//   useEffect(() => {
//     const fetchWorkouts = async () => {
//       if (!session?.user) return;

//       const { data, error } = await supabase
//         .from("workouts")
//         .select("*")
//         .eq("user_id", session.user.id);

//       if (error) {
//         console.error("Failed to fetch workouts:", error);
//       } else if (data) {
//         setWorkouts(data);
//       }
//     };

//     if (session) {
//       fetchWorkouts();
//     }
//   }, [session, supabase]);

//   // Show a loading message while checking session status
//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   // Safely check subscription status in app_metadata
//   const extendedUser = session?.user as unknown as ExtendedUser;
//   const isSubscribed = extendedUser?.app_metadata?.subscription?.status === "active";

//   return (
//     <div className="min-h-screen p-4">
//       <h1 className="text-2xl font-bold">Dashboard</h1>
//       <p>Welcome, {session?.user?.email}</p>

//       {workouts.length === 0 ? (
//         <p className="mt-4">No workouts yet</p>
//       ) : (
//         <div className="mt-4 space-y-4">
//           {workouts.map((workout) => {
//             const workoutDate = workout.created_at 
//               ? new Date(workout.created_at).toLocaleDateString() 
//               : "Unknown Date";
//             return (
//               <div
//                 key={workout.id}
//                 className="border p-4 shadow-md rounded-md hover:scale-105 transition-transform"
//               >
//                 <p className="text-sm text-gray-500">
//                   Workout Date: {workoutDate}
//                 </p>
//                 {/* Render your workout_data or other fields here */}
//                 {workout.workout_data && (
//                   <div className="mt-2 whitespace-pre-line">
//                     {workout.workout_data}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );


//       {/* Subscription Check */}
//       {!isSubscribed ? (
//         <div className="mt-4">
//           <p className="mb-2">Subscribe to get full access</p>
//           <SubscribeButton />
//         </div>
//       ) : (
//         <p className="mt-4">You have full access</p>
//       )}
    
  
// }
