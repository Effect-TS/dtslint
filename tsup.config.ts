import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  clean: true,
  publicDir: true,
  noExternal: [/@effect/]
})
