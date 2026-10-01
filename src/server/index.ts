import type { CreateServerOptions, HttpAdapter, StartedServer } from "./adapter.ts"
import { isBun, isDeno } from "./detect.ts"
import { bunAdapter } from "./bun.ts"
import { nodeAdapter } from "./node.ts"
import { denoAdapter } from "./deno.ts"

export type { CreateServerOptions, HttpAdapter, StartedServer }

const adapters: Record<string, HttpAdapter> = {
  bun: bunAdapter,
  node: nodeAdapter,
  deno: denoAdapter,
}

export async function createServer(options: CreateServerOptions): Promise<StartedServer> {
  const runtime = isBun ? "bun" : isDeno ? "deno" : "node"
  return adapters[runtime]!.create(options)
}