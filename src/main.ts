import { z } from 'zod'
import { NervFactory } from './factory.ts'
import { createRouteFactory } from './router/factory.ts'

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
await app.listen(3000)
