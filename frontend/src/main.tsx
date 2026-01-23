import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import Header from "./components/Header.tsx";
import AppRoutes from "./components/AppRoutes.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { CoordinateProvider } from "./contexts/CoordinateContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CoordinateProvider>
          <Header />
          <AppRoutes />
        </CoordinateProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
