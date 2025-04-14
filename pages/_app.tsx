import "@/styles/globals.css";
import { Inter, Quicksand } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });
const quickSand = Quicksand({ subsets: ["latin"] });

const queryClient = new QueryClient();
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function App({ Component, pageProps }: AppProps) {
  if (!googleClientId) {
    console.error("FATAL: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set!");
    return <div>Error: Google Client ID configuration is missing.</div>;
  }
  return (
    <div className={inter.className}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={googleClientId}>
          <Component {...pageProps} />
          <Toaster />
          <ReactQueryDevtools />
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </div>
  );
}
