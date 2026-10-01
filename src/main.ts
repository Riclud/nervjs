import { NervFactory } from './factory.ts'
import { runtimeName } from './server/detect.ts'

const app = NervFactory.create(
  (req) =>
    new Response(JSON.stringify({ runtime: runtimeName(), method: req.method, url: req.url }), {
      headers: { 'content-type': 'application/json' },
    }),
)

const server = await app.listen(3000)
console.log(`nervjs listening on http://${server.hostname}:${server.port} (${runtimeName()})`)
