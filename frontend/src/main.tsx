import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import Header from "./components/Header.tsx";
import AppRoutes from "./components/AppRoutes.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { CoordinateProvider } from "./contexts/CoordinateContext";
import { ToastProvider } from "./contexts/ToastContext.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CoordinateProvider>
            <ToastProvider>
              <Header />
              <AppRoutes />
            </ToastProvider>
          </CoordinateProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
