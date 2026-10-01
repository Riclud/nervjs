import type { z, ZodTypeAny } from 'zod'

export type ResponseMap = Record<number, ZodTypeAny>

export interface RouteSchema {
  params?: ZodTypeAny
  query?: ZodTypeAny
  body?: ZodTypeAny
  headers?: ZodTypeAny
  response?: ResponseMap
}

type InferOrDefault<T extends ZodTypeAny | undefined, Default> = T extends ZodTypeAny ? z.infer<T> : Default

export type TransportOf<S extends RouteSchema> = {
  params: InferOrDefault<S['params'], Record<string, string>>
  query: InferOrDefault<S['query'], Record<string, string>>
  headers: InferOrDefault<S['headers'], Headers>
  body: S['body'] extends ZodTypeAny ? z.infer<S['body']> : unknown
}

export type ResponseOf<S extends RouteSchema> = S extends { response: ResponseMap }
  ? { [K in keyof S['response']]: z.infer<S['response'][K]> }
  : Record<number, never>

export type ResponseData<S extends RouteSchema> = ResponseOf<S>[keyof ResponseOf<S>]
