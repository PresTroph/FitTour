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
  // Initialize the Supabase client once
  const [supabase] = useState(() => createBrowserClient());

  // session can be null or a valid Session
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1) Fetch the initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Error fetching session:", error);
      }
      setSession(data.session);
      setLoading(false);
    });

    // 2) Subscribe to auth state changes
    const { data: subscriptionData } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
      }
    );

    // 3) Cleanup subscription on unmount
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

