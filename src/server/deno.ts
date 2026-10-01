import type { HttpAdapter, StartedServer } from "./adapter.ts"

declare const Deno: {
  serve(options: {
    port: number
    hostname: string
    handler: (req: Request) => Response | Promise<Response>
  }): { shutdown(): Promise<void> }
}

export const denoAdapter: HttpAdapter = {
  create({ port, hostname = "localhost", fetch }) {
    const server = Deno.serve({ port, hostname, handler: fetch })
    return Promise.resolve({ port, hostname, stop: () => server.shutdown() })
  },
}