export interface CreateServerOptions {
  port: number
  hostname?: string
  fetch: (req: Request) => Response | Promise<Response>
}

export interface StartedServer {
  port: number
  hostname: string
  stop(): Promise<void>
}

export interface HttpAdapter {
  create(options: CreateServerOptions): Promise<StartedServer>
}
