import { createServer, type StartedServer } from './server/index.ts'
import { compileRoutes } from './router/compile.ts'
import type { Route } from './router/factory.ts'
import { buildOpenApi } from './openapi.ts'
import { jsonResponse } from './core/errors.ts'
import { clearScreen, printListening, printRoutes } from './logger.ts'
import { runtimeName } from './server/detect.ts'

export type FetchHandler = (req: Request) => Response | Promise<Response>

export interface OpenApiOptions {
  path?: string
  title?: string
  version?: string
  description?: string
}

export interface AppOptions {
  routes: Route[]
  container: unknown
  openapi?: OpenApiOptions | boolean
  logging?: boolean
}

export interface NervApplication {
  fetch: FetchHandler
  listen: (port: number, hostname?: string) => Promise<StartedServer>
  close: () => Promise<void>
}

export const NervFactory = {
  create: (args: AppOptions | FetchHandler): NervApplication => {
    let running: StartedServer | undefined
    let fetch: FetchHandler
    const routes: Route[] = []

    if (typeof args === 'function') {
      fetch = args
    } else {
      const openapi = args.openapi ?? true
      if (openapi) {
        const opts: OpenApiOptions = openapi === true ? {} : openapi
        const spec = buildOpenApi(args.routes, {
          title: opts.title,
          version: opts.version,
          description: opts.description,
        })
        const docRoute: Route = {
          method: 'GET',
          path: (opts.path ?? '/openapi.json').replace(/^\/+|\/+$/g, ''),
          schema: {},
          handler: () => jsonResponse(200, spec),
        }
        routes.push(docRoute)
      }
      routes.push(...args.routes)
      fetch = compileRoutes(routes, args.container)
    }

    return {
      fetch,
      listen: async (port, hostname) => {
        running = await createServer({ port, hostname, fetch })
        if (typeof args !== 'function' && args.logging !== false) {
          clearScreen()
          printRoutes(routes)
          printListening(running, runtimeName())
        }
        return running
      },
      close: async () => {
        await running?.stop()
        running = undefined
      },
    }
  },
}
