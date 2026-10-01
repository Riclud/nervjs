import type { StartedServer } from './server/adapter.ts'
import type { Route } from './router/factory.ts'

const useColor =
  typeof process !== 'undefined' && !!process.stdout && (process.stdout as { isTTY?: boolean }).isTTY === true

const paint = (code: string) => (text: string) => (useColor ? `\u001b[${code}m${text}\u001b[0m` : text)

const bold = paint('1')
const dim = paint('2')
const green = paint('32')
const blue = paint('34')
const yellow = paint('33')
const magenta = paint('35')
const red = paint('31')
const cyan = paint('36')

const methodColor: Record<string, (text: string) => string> = {
  GET: green,
  POST: blue,
  PUT: yellow,
  PATCH: magenta,
  DELETE: red,
  HEAD: cyan,
  OPTIONS: dim,
}

const methodWidth = Math.max(...Object.keys(methodColor).map((m) => m.length))

export const clearScreen = (): void => {
  if (useColor) process.stdout.write('\u001b[2J\u001b[3J\u001b[H')
}

export const printRoutes = (routes: Route[]): void => {
  for (const route of routes) {
    const colorFn = methodColor[route.method] ?? ((text: string) => text)
    const method = colorFn(route.method.padEnd(methodWidth))
    const path = `/${route.path.replace(/^\/+|\/+$/g, '')}`.padEnd(26)
    const tag = route.tag ? dim(route.tag.padEnd(10)) : ' '.padEnd(10)
    const summary = route.summary ? dim(route.summary) : ''
    console.log(`  ${method}  ${path}  ${tag}  ${summary}`)
  }
  console.log(`  ${dim(`${routes.length} routes`)}`)
}

export const printListening = (server: StartedServer, runtime: string): void => {
  console.log(`  ${green('→')} listening on http://${server.hostname}:${server.port} (${bold(runtime)})`)
}
