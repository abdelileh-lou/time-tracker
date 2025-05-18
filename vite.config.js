import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss({
      config: "./tailwind.config.js", // Explicit path to config
    }),
  ],
  optimizeDeps: {
    include: ["qrcode.react"],
  },
});
