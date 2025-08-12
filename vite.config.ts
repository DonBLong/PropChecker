import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      name: "@donblong/propchecker",
      entry: ["src/propchecker.ts"],
      fileName: (format) => `propchecker.${format}.js`,
    },
  },
  plugins: [dts()],
});
