import { createServer, type StartedServer } from './server/index.ts'

export type FetchHandler = (req: Request) => Response | Promise<Response>

export interface NervApplication {
  fetch: FetchHandler
  listen: (port: number, hostname?: string) => Promise<StartedServer>
  close: () => Promise<void>
}

export const NervFactory = {
  create: (fetch: FetchHandler): NervApplication => {
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
