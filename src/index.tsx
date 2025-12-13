import { createRoot } from "react-dom/client";
import { MeshProvider } from "@meshsdk/react";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
// Import Mesh SDK styles using the exported path
import "@meshsdk/react/styles.css";

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

