import type { HttpAdapter } from './adapter.ts'

export const bunAdapter: HttpAdapter = {
  create: ({ port, hostname = 'localhost', fetch }) => {
    const server = Bun.serve({ port, hostname, fetch })
    return Promise.resolve({ port, hostname, stop: () => Promise.resolve(server.stop()) })
  },
}
