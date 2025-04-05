// pages/_app.tsx
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";
import type { AppProps } from "next/app";
import "../styles/globals.css"; // Adjust the path if necessary

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default MyApp;

