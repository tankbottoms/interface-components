import { defineConfig } from "oxlint";

/*
 * The anti-slop rules are a house style, and a house style only means anything
 * applied to code the house writes. `magx/` is vendored upstream (mlalma/magx)
 * and Lit's own API forces several of the shapes these rules ban — `render()`
 * returns `unknown` because that is LitElement's signature, not a widening we
 * chose. Linting it produced 200+ findings, none of them actionable without
 * forking the library, which is exactly the noise that trains you to ignore a
 * linter. Scoped to `src/` and `tools/`; the vendored tree is left alone.
 */
export default defineConfig({
  ignorePatterns: [".claude/**",".codex/**",".cursor/**","tools/oxlint/anti-slop/**",".svelte-kit/**","build/**","dist/**","magx/**"],
  jsPlugins: [{ name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" }],
  rules: {
    "anti-slop/no-chained-type-assertions": "error",
    "anti-slop/no-conditional-empty-object-spread": "error",
    "anti-slop/no-known-value-widening": "error",
    "anti-slop/no-module-mocking": "error",
    "anti-slop/no-object-parameters": "error",
    "anti-slop/no-reflect-apply": "error",
    "anti-slop/no-reflect-get": "error",
    "anti-slop/no-runtime-typeof": "error",
    "anti-slop/no-shape-in-symbol-names": "error",
    "anti-slop/no-unknown-parameters": "error",
    "anti-slop/no-unknown-returns": "error",
    "anti-slop/no-unknown-type-aliases": "error",
    "anti-slop/no-unsafe-dictionary-type": "error",
    "anti-slop/no-widen-then-assert": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error"
  }
});
