import type { CreateServerOptions, HttpAdapter, StartedServer } from "./adapter.ts"
import { isBun } from "./detect.ts"
import { bunAdapter } from "./bun.ts"
import { nodeAdapter } from "./node.ts"

export type { CreateServerOptions, HttpAdapter, StartedServer }

const adapters: Record<string, HttpAdapter> = {
  bun: bunAdapter,
  node: nodeAdapter,
}

export async function createServer(options: CreateServerOptions): Promise<StartedServer> {
  const runtime = isBun ? "bun" : "node"
  return adapters[runtime]!.create(options)
}
