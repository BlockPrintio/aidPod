import React from "react";
import { createRoot } from "react-dom/client";

console.log("🚀 Starting app initialization...");

// Minimal test - just render a simple div
try {
  const container = document.getElementById("root");
  console.log("📦 Container found:", container);
  
  if (!container) {
    throw new Error("Root element not found");
  }

  console.log("🎨 Creating root...");
  const root = createRoot(container);
  
  console.log("⚛️ Rendering test content...");
  
  // Render absolute minimum to test if React works
  root.render(
    <div style={{ 
      padding: '50px', 
      background: '#fff', 
      color: '#000', 
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#000', marginBottom: '20px' }}>✅ React is Working!</h1>
      <p style={{ color: '#333', marginBottom: '10px' }}>If you see this, React is rendering correctly.</p>
      <p style={{ color: '#666' }}>Now let's load the full app...</p>
    </div>
  );
  
  console.log("✅ Test content rendered successfully");
  
  // After 2 seconds, try loading the full app
  setTimeout(() => {
    console.log("🔄 Loading full app...");
    import("./App").then(({ default: App }) => {
      import("@meshsdk/react").then(({ MeshProvider }) => {
        import("./styles/tailwind.css");
        import("./styles/index.css");
        import("@meshsdk/react/styles.css");
        
        root.render(
          <MeshProvider>
            <App />
          </MeshProvider>
        );
        console.log("✅ Full app loaded");
      }).catch((error) => {
        console.error("❌ Error loading MeshProvider:", error);
        root.render(
          <div style={{ padding: '50px', background: '#fff', color: '#000' }}>
            <h1>MeshProvider Error</h1>
            <p>{error?.message}</p>
            <App />
          </div>
        );
      });
    }).catch((error) => {
      console.error("❌ Error loading App:", error);
      root.render(
        <div style={{ padding: '50px', background: '#fff', color: '#000' }}>
          <h1>App Load Error</h1>
          <p>{error?.message}</p>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>{error?.stack}</pre>
        </div>
      );
    });
  }, 2000);
  
} catch (error) {
  console.error("❌ Failed to initialize:", error);
  console.error("Error stack:", error?.stack);
  
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
