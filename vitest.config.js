import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: 'forks', // 或 'threads'，取决于 Node.js 版本，forks 通常更稳健
    poolOptions: {
      forks: {
        singleFork: true, // 确保串行运行，避免 Token 刷新冲突
      }
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    envDir: ".", // 加载 .env.test 文件
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/next-connector.ts", "src/next-secure-store.ts"],
      reporter: ["text", "text-summary"],
    },
  },
});
