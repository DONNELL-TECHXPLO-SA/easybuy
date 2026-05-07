import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(currentDir, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    restoreMocks: true,
    clearMocks: true,
  },
});
