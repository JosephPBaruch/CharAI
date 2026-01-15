// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

export default {
  server: {
    host: true,
    port: 5173,
    hmr: {
      host: "192.168.254.93",
      protocol: "ws",
      // clientPort: 80, // sometimes needed if proxying WS through :80
    },
  },
};
