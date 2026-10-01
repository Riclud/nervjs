import { createServer } from "./server/index.ts"
import { runtimeName } from "./server/detect.ts"

const server = await createServer({
  port: 3000,
  fetch: (req) =>
    new Response(JSON.stringify({ runtime: runtimeName(), method: req.method, url: req.url }), {
      headers: { "content-type": "application/json" },
    }),
})

console.log(`nervjs listening on http://${server.hostname}:${server.port} (${runtimeName()})`)