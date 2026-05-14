import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "node",
      globals: true,
      exclude: ["dist/**", "node_modules/**", "coverage/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html", "lcov"],
        exclude: [
          "eslint.config.js",
          "eslintrc.cjs",
          "dist/**",
          "node_modules/**",
          "coverage/**",
          "vitest.config.ts",
          "src/app/**",
          "src/components/**",
          "src/context/**",
          "src/data/**",
          "src/hooks/**",
          "src/main.tsx",
          "src/pages/**",
          "src/types/**",
          "vite.config.ts",
        ],
      },
    },
  })
);