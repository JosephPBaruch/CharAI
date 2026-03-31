import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { ThemeProvider, CssBaseline } from "@mui/material";
import "./index.css";
import Header from "./components/Header.tsx";
import AppRoutes from "./components/AppRoutes.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { CoordinateProvider } from "./contexts/CoordinateContext";
import { ToastProvider } from "./contexts/ToastContext.tsx";
import theme from "./styles/theme.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
