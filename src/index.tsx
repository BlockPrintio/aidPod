import { createRoot } from "react-dom/client";
import { MeshProvider } from "@meshsdk/react";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
// Import Mesh SDK styles using the exported path
import "@meshsdk/react/styles.css";

// Add error handling for initialization
try {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root element not found");
  }

  const root = createRoot(container);

  // Wrap entire app with MeshProvider for wallet functionality
  root.render(
    <MeshProvider>
      <App />
    </MeshProvider>
  );
  
  console.log("✅ App initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize app:", error);
  // Display error on page
  const container = document.getElementById("root");
  if (container) {
    container.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif;">
        <h1 style="color: red;">Application Error</h1>
        <p>Failed to initialize the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px;">${error.message || error}</pre>
        <p>Please check the browser console for more details.</p>
      </div>
    `;
  }
}

