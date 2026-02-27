import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/next-connector.ts", "src/next-secure-store.ts"],
      reporter: ["text", "text-summary"],
    },
  },
});
