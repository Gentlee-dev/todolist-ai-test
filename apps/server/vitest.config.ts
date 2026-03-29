import { defineConfig } from "vitest/config";

export default defineConfig({
  define: {
    "process.env.NODE_ENV": '"test"',
  },
  test: {
    env: {
      NODE_ENV: "test",
    },
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 10000,
    hookTimeout: 10000,
    fileParallelism: false,
    sequence: { concurrent: false },
  },
});
