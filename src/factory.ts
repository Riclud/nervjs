import { createServer, type StartedServer } from './server/index.ts'
import { compileRoutes } from './router/compile.ts'
import type { Route } from './router/factory.ts'

export type FetchHandler = (req: Request) => Response | Promise<Response>

export interface AppOptions {
  routes: Route[]
  container: unknown
}

export interface NervApplication {
  fetch: FetchHandler
  listen: (port: number, hostname?: string) => Promise<StartedServer>
  close: () => Promise<void>
}

export const NervFactory = {
  create: (args: AppOptions | FetchHandler): NervApplication => {
    const fetch: FetchHandler = typeof args === 'function' ? args : compileRoutes(args.routes, args.container)
    let running: StartedServer | undefined

    return {
      fetch,
      listen: async (port, hostname) => {
        running = await createServer({ port, hostname, fetch })
        return running
      },
      close: async () => {
        await running?.stop()
        running = undefined
      },
    }
  },
}
