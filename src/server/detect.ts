export const isBun = typeof process !== "undefined" && !!process.versions.bun

export const runtimeName = () => (isBun ? "bun" : "node")