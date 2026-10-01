import type { SetContext } from '../core/context.ts'
import { HttpError, jsonResponse, normalizeIssues, validationResponse } from '../core/errors.ts'
import type { FetchHandler } from '../factory.ts'
import { compilePath, parseParams } from './path.ts'
import type { Method, Route } from './factory.ts'

const noBody = new Set<Method>(['GET', 'HEAD', 'OPTIONS'])

interface CompiledRoute {
  route: Route
  keys: string[]
  pattern: RegExp
}

const makeSetContext = (): SetContext => ({ headers: {} })

export const compileRoutes = (routes: Route[], deps: unknown): FetchHandler => {
  const compiled: CompiledRoute[] = routes.map((route) => {
    const { pattern, keys } = compilePath(route.path)
    return { route, pattern, keys }
  })

  const runHooks = async (hooks: ((ctx: unknown) => unknown)[] | undefined, ctx: unknown): Promise<Response | null> => {
    if (!hooks) return null
    for (const hook of hooks) {
      const out = await hook(ctx)
      if (out instanceof Response) return out
    }
    return null
  }

  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url)
    const byPath = compiled.filter((c) => c.pattern.test(url.pathname))
    if (!byPath.length) return jsonResponse(404, { error: 'not_found' })

    const match = byPath.find((c) => c.route.method === req.method)
    if (!match) {
      const allow = byPath.map((c) => c.route.method).join(', ')
      return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
        status: 405,
        headers: { 'content-type': 'application/json', allow },
      })
    }

    const { route, keys } = match
    const params = parseParams(url.pathname, { pattern: match.pattern, keys }) ?? {}
    const query = Object.fromEntries(url.searchParams.entries())

    const headerPlain: Record<string, string> = {}
    req.headers.forEach((value, key) => (headerPlain[key] = value))

    const ctx: {
      params: Record<string, unknown>
      query: Record<string, unknown>
      headers: Headers
      body: unknown
      deps: unknown
      state: Record<string, unknown>
      set: SetContext
      result?: unknown
    } = {
      params,
      query,
      headers: req.headers,
      body: undefined,
      deps,
      state: {},
      set: makeSetContext(),
    }

    const validate = (schema: unknown, value: unknown, assign: (data: unknown) => void): Response | null => {
      if (!schema) return null
      const result = (
        schema as { safeParse: (v: unknown) => { success: boolean; data: unknown; error?: unknown } }
      ).safeParse(value)
      if (result.success) {
        assign(result.data)
        return null
      }
      return validationResponse(normalizeIssues(result.error as never))
    }

    try {
      for (const [schema, value, assign] of [
        [route.schema.params, params, (v: unknown) => (ctx.params = v as Record<string, unknown>)],
        [route.schema.query, query, (v: unknown) => (ctx.query = v as Record<string, unknown>)],
        [route.schema.headers, headerPlain, () => {}],
      ] as const) {
        const bad = validate(schema, value, assign)
        if (bad) return bad
      }

      const bad = await runHooks(route.pre as ((ctx: unknown) => unknown)[], ctx)
      if (bad) return bad

      if (route.schema.body && req.method && !noBody.has(req.method as Method)) {
        const raw = await req.text()
        let value: unknown
        try {
          value = raw ? JSON.parse(raw) : {}
        } catch {
          return validationResponse([{ path: 'body', message: 'invalid json' }])
        }
        const badBody = validate(route.schema.body, value, (v: unknown) => (ctx.body = v))
        if (badBody) return badBody
      }

      let result: unknown = await route.handler(ctx)
      ctx.result = result

      const badPost = await runHooks(route.post as ((ctx: unknown) => unknown)[], ctx)
      if (badPost) return badPost

      if (result instanceof Response) return result

      const status = ctx.set.status ?? 200
      const headers = { 'content-type': 'application/json', ...ctx.set.headers }
      return new Response(JSON.stringify(result), { status, headers })
    } catch (error) {
      if (error instanceof HttpError) return error.toResponse()
      return jsonResponse(500, { error: 'internal' })
    }
  }
}
