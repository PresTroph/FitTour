import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

function InnerApp({ Component, pageProps }: AppProps) {
  const { session } = useAuth();

  useEffect(() => {
    console.log("👀 Session from _app.tsx:", session);
  }, [session]);

  return <Component {...pageProps} />;
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <InnerApp {...props} />
    </AuthProvider>
  );
}

