import { z } from 'zod'
import { NervFactory } from './factory.ts'
import { createRouteFactory } from './router/factory.ts'
import { runtimeName } from './server/detect.ts'

const container = {}

const appRoute = createRouteFactory<typeof container, {}>()

const routes = [
  appRoute.defineRoute({
    method: 'GET',
    path: '/health',
    schema: { response: { 200: z.object({ status: z.string() }) } },
    handler: () => ({ status: 'ok' }),
  }),
]

const app = NervFactory.create({ routes, container })
const server = await app.listen(3000)
console.log(`nervjs listening on http://${server.hostname}:${server.port} (${runtimeName()})`)
