import { createRoot } from "react-dom/client";
import { MeshProvider } from "@meshsdk/react";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
// Import Mesh SDK styles using the exported path
import "@meshsdk/react/styles.css";

console.log("🚀 Starting app initialization...");

// Add error handling for initialization
try {
  const container = document.getElementById("root");
  console.log("📦 Container found:", container);
  
  if (!container) {
    throw new Error("Root element not found");
  }

  console.log("🎨 Creating root...");
  const root = createRoot(container);
  
  console.log("⚛️ Rendering app...");
  
  // Wrap entire app with MeshProvider for wallet functionality
  root.render(
    <MeshProvider>
      <App />
    </MeshProvider>
  );
  
  console.log("✅ App initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize app:", error);
  console.error("Error stack:", error?.stack);
  
  // Display error on page
  const container = document.getElementById("root");
  if (container) {
    container.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; background: #fff;">
        <h1 style="color: red;">Application Error</h1>
        <p>Failed to initialize the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error?.message || error}</pre>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px;">${error?.stack || 'No stack trace'}</pre>
        <p>Please check the browser console for more details.</p>
      </div>
    `;
  }
}
