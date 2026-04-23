import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: 'forks',
    // Vitest 4 将 poolOptions 提升为顶层选项；使用 fileParallelism 关闭文件级并行，避免 Token 刷新冲突
    fileParallelism: false,
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
