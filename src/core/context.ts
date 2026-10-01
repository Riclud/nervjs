export interface SetContext {
  status?: number
  headers: Record<string, string>
}

export interface RouteTransport {
  params: Record<string, string>
  query: Record<string, string>
  headers: Headers
  body: unknown
}

export type RequestContext<Deps, State, Transport = RouteTransport> = Transport & {
  deps: Deps
  state: State
  set: SetContext
  result?: unknown
}
