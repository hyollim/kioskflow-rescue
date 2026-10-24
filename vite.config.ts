import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: "/kioskflow-rescue/",
  plugins: [react()],
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: { url: "http://localhost:4173/kioskflow-rescue/" },
    },
    setupFiles: "./src/test/setup.ts",
    css: false,
    restoreMocks: true,
  },
});
