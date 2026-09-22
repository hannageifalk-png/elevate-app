import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { MockStateProvider } from "./context/MockStateContext.tsx";
import AdminPanel from "./components/AdminPanel.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
    <MockStateProvider>
      <AuthProvider>
        <App />
        {import.meta.env.DEV && <AdminPanel />}
      </AuthProvider>
    </MockStateProvider>
    </BrowserRouter>
  </StrictMode>
);
