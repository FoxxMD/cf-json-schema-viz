import { defineConfig } from "tsup";
import { copyFileSync } from "fs";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "es2020",
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  external: ["react", "react-dom"],
  // Bundle @stoplight packages to ensure their code is included
  noExternal: [/@stoplight\/.*/],
  esbuildOptions(options) {
    // Replace lodash with lodash-es to avoid CJS require() calls in browser
    options.alias = {
      lodash: "lodash-es",
    };
  },
  onSuccess: async () => {
    // Copy CSS file to dist - exported separately for consumers to import
    copyFileSync("src/styles.css", "dist/styles.css");
  },
});
