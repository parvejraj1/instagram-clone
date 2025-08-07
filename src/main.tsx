import { createRoot } from "react-dom/client";
import { ConvexProvider } from "convex/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import { initializeDarkMode } from "./darkMode";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error("Missing VITE_CONVEX_URL in environment variables");
}

const convex = new ConvexReactClient(convexUrl);

// Initialize dark mode before rendering
initializeDarkMode();

createRoot(document.getElementById("root")!).render(
  <ConvexProvider client={convex}>
    <App />
  </ConvexProvider>
);
