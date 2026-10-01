import { createServer, type IncomingMessage } from "node:http"
import type { HttpAdapter, StartedServer } from "./adapter.ts"

const noBody = new Set(["GET", "HEAD", "OPTIONS", "TRACE", "CONNECT"])

const toBody = async (req: IncomingMessage): Promise<Uint8Array> => {
  const chunks: Uint8Array[] = []
  for await (const chunk of req) chunks.push(chunk as Uint8Array)
  return Buffer.concat(chunks)
}

const nodeAdapter: HttpAdapter = {
  create({ port, hostname = "localhost", fetch }) {
    return new Promise((resolve, reject) => {
      const server = createServer(async (req, res) => {
        const url = `http://${req.headers.host ?? `${hostname}:${port}`}${req.url ?? "/"}`
        const init: RequestInit = {
          method: req.method,
          headers: Object.fromEntries(
            Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : (v ?? "")]),
          ),
        }
        if (req.method && !noBody.has(req.method)) {
          init.body = await toBody(req)
        }
        const response = await fetch(new Request(url, init))
        res.writeHead(response.status, Object.fromEntries(response.headers))
        res.end(Buffer.from(await response.arrayBuffer()))
      })
      server.on("error", reject)
      server.listen(port, hostname, () => resolve({ port, hostname, stop: () => new Promise((r) => server.close(() => r())) }))
    })
  },
}

export { nodeAdapter }