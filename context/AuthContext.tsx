"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";

interface AuthContextType {
  supabase: ReturnType<typeof createBrowserClient>;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // 1) Grab env variables (string | undefined)
  const envSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const envSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 2) Runtime check: if they're missing, throw an error.
  //    This ensures at runtime we never pass undefined to createBrowserClient.
  if (!envSupabaseUrl || !envSupabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  // 3) Narrow the types so that TS knows these are strings, not undefined.
  const supabaseUrl: string = envSupabaseUrl;
  const supabaseAnonKey: string = envSupabaseAnonKey;

  // 4) Create the Supabase client with two mandatory arguments.
  const [supabase] = useState(() => createBrowserClient(supabaseUrl, supabaseAnonKey));

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error fetching session:", error);
      }
      setSession(data.session);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: subscriptionData } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscriptionData.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ supabase, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
