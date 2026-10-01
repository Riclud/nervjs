import type { RequestContext } from '../core/context.ts'
import type { PostHook, PreHook } from '../core/hooks.ts'
import type { ResponseData, RouteSchema, TransportOf } from './schema.ts'

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

type RouteCtx<Deps, State, S extends RouteSchema> = RequestContext<Deps, State, TransportOf<S>>

export interface RouteOptions<Deps, State, S extends RouteSchema> {
  method: Method
  path: string
  tag?: string
  summary?: string
  schema: S
  pre?: PreHook<RouteCtx<Deps, State, S>>[]
  post?: PostHook<RouteCtx<Deps, State, S>>[]
  handler: (ctx: RouteCtx<Deps, State, S>) => ResponseData<S> | Response
}

export interface Route {
  method: Method
  path: string
  tag?: string
  summary?: string
  schema: RouteSchema
  pre?: PreHook<unknown>[]
  post?: PostHook<unknown>[]
  handler: (ctx: unknown) => unknown | Response
}

type DefineRoute<Deps, State> = <S extends RouteSchema>(options: RouteOptions<Deps, State, S>) => Route

export const createRouteFactory = <Deps, State>(): { defineRoute: DefineRoute<Deps, State> } => {
  return {
    defineRoute: <S extends RouteSchema>(options: RouteOptions<Deps, State, S>): Route => ({
      method: options.method,
      path: options.path,
      tag: options.tag,
      summary: options.summary,
      schema: options.schema,
      pre: options.pre as Route['pre'],
      post: options.post as Route['post'],
      handler: options.handler as unknown as Route['handler'],
    }),
  }
}
