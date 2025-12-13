import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";

console.log("🚀 Starting app initialization...");

// Polyfill for Buffer if not available
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = require('buffer/').Buffer;
}

// Polyfill for global if not available
if (typeof window !== 'undefined' && !window.global) {
  window.global = window;
}

// Add error handling for initialization
try {
  const container = document.getElementById("root");
  console.log("📦 Container found:", container);
  
  if (!container) {
    throw new Error("Root element not found");
  }

  console.log("🎨 Creating root...");
  const root = createRoot(container);
  
  console.log("⚛️ Loading MeshProvider...");
  
  // Dynamically import MeshProvider to ensure polyfills are loaded first
  import("@meshsdk/react").then(({ MeshProvider }) => {
    import("@meshsdk/react/styles.css").then(() => {
      console.log("✅ MeshProvider loaded, rendering app...");
      
      root.render(
        <MeshProvider>
          <App />
        </MeshProvider>
      );
      
      console.log("✅ App initialized successfully");
    }).catch((error) => {
      console.warn("Could not load Mesh styles, continuing anyway:", error);
      root.render(
        <MeshProvider>
          <App />
        </MeshProvider>
      );
    });
  }).catch((error) => {
    console.error("❌ Failed to load MeshProvider:", error);
    // Render app without MeshProvider as fallback
    root.render(<App />);
    console.log("⚠️ App rendered without wallet functionality");
  });
} catch (error) {
  console.error("❌ Failed to initialize app:", error);
  console.error("Error stack:", error?.stack);
  
  // Display error on page
  const container = document.getElementById("root");
  if (container) {
    container.innerHTML = `
      <div style="padding: 50px; font-family: Arial, sans-serif; background: #fff; color: #000;">
        <h1 style="color: red;">Application Error</h1>
        <p>Failed to initialize the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error?.message || error}</pre>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px;">${error?.stack || 'No stack trace'}</pre>
        <p>Please check the browser console for more details.</p>
      </div>
    `;
  }
}
