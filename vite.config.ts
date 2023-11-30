import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json", "html"],
      enabled: true,
    },
    testTimeout: 10 * 1000,
  },
});
