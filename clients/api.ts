import { GraphQLClient } from "graphql-request";

// Get the URL from environment variables
const apiUrl = "https://kartikey-twitter.onrender.com/graphql";

// --- Add this check ---
if (!apiUrl || typeof apiUrl !== "string" || apiUrl.trim() === "") {
  // Log a clear error in the server console during build/SSR
  // and in the browser console if it somehow gets there.
  console.error("------------------------------------------------------");
  console.error("FATAL: NEXT_PUBLIC_API_URL is not defined or empty.");
  console.error("GraphQL client cannot be initialized.");
  console.error("Verify the environment variable in your deployment.");
  console.error("------------------------------------------------------");

  // You might throw an error here, but that could break SSR if the client
  // is initialized at the module level. A clear log is often better.
  // Alternatively, initialize with a dummy/invalid URL that clearly fails.
  // For now, we'll let it proceed but the log should appear.
}
const isClient = typeof window !== "undefined";

export const graphqlClient = new GraphQLClient(apiUrl as string, {
  headers: () => ({
    Authorization: isClient
      ? `Bearer ${window.localStorage.getItem("__twitter_token")}`
      : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoic2VydmVyIiwiaWF0IjoxNzQ0NjY3MTk2LCJleHAiOjE3NzYyMDMxOTZ9.w69S2D6ouT2l_Wpro6osC4j7xOyQ8SruRcJH1y7SxNU", // Add server-side token
  }),
});

// Optional: Log the URL the client *is* using
console.log(
  "GraphQL Client Initialized with URL:",
  apiUrl || "INVALID (Check ENV)"
);
