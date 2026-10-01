declare const Deno: { serve?: unknown }

export const isBun = typeof process !== "undefined" && !!process.versions.bun
export const isDeno = typeof Deno !== "undefined" && typeof Deno.serve === "function"
export const runtimeName = () => (isBun ? "bun" : isDeno ? "deno" : "node")