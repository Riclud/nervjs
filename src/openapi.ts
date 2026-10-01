import type { z, ZodTypeAny } from 'zod'
import type { Route } from './router/factory.ts'

export interface OpenApiMeta {
  title?: string
  version?: string
  description?: string
}

type JsonSchema = Record<string, unknown>

const toJsonSchema = (schema: ZodTypeAny): JsonSchema => {
  const { $schema: _drop, ...rest } = schema.toJSONSchema()
  return rest
}

const objectShape = (schema: ZodTypeAny): { properties: Record<string, JsonSchema>; required: string[] } | null => {
  const json = toJsonSchema(schema)
  if (json.type !== 'object') return null
  return {
    properties: (json.properties as Record<string, JsonSchema>) ?? {},
    required: (json.required as string[]) ?? [],
  }
}

const toParameters = (schema: ZodTypeAny | undefined, location: 'path' | 'query' | 'header'): JsonSchema[] => {
  if (!schema) return []
  const shape = objectShape(schema)
  if (!shape) return [{ name: 'value', in: location, schema: toJsonSchema(schema) }]
  return Object.entries(shape.properties).map(([name, prop]) => ({
    name,
    in: location,
    required: location === 'path' ? true : shape.required.includes(name),
    schema: prop,
  }))
}

const statusDescriptions: Record<string, string> = {
  '200': 'OK',
  '201': 'Created',
  '202': 'Accepted',
  '204': 'No Content',
  '400': 'Bad Request',
  '401': 'Unauthorized',
  '403': 'Forbidden',
  '404': 'Not Found',
  '409': 'Conflict',
  '422': 'Unprocessable Entity',
  '429': 'Too Many Requests',
  '500': 'Internal Server Error',
}

export const buildOpenApi = (routes: Route[], meta: OpenApiMeta = {}): JsonSchema => {
  const paths: Record<string, JsonSchema> = {}

  for (const route of routes) {
    const openapiPath = `/${route.path.replace(/^\/+|\/+$/g, '')}`.replace(/:([^/]+)/g, '{$1}')
    const method = route.method.toLowerCase()

    const operation: JsonSchema = {
      tags: route.tag ? [route.tag] : [],
      summary: route.summary,
      parameters: [
        ...toParameters(route.schema.params, 'path'),
        ...toParameters(route.schema.query, 'query'),
        ...toParameters(route.schema.headers, 'header'),
      ],
      responses: {} as Record<string, unknown>,
    }

    if (route.schema.body) {
      operation.requestBody = {
        required: true,
        content: { 'application/json': { schema: toJsonSchema(route.schema.body) } },
      }
    }

    const responses: Record<string, unknown> = {}
    const responseMap = route.schema.response ?? {}
    if (!Object.keys(responseMap).length) {
      responses['200'] = { description: 'OK' }
    } else {
      for (const [status, schema] of Object.entries(responseMap)) {
        responses[status] = {
          description: statusDescriptions[status] ?? 'Response',
          content: { 'application/json': { schema: toJsonSchema(schema as ZodTypeAny) } },
        }
      }
    }
    operation.responses = responses

    paths[openapiPath] = {
      ...(paths[openapiPath] ?? {}),
      [method]: operation,
    }
  }

  return {
    openapi: '3.1.0',
    info: {
      title: meta.title ?? 'NervJS API',
      version: meta.version ?? '0.0.0',
      ...(meta.description ? { description: meta.description } : {}),
    },
    paths,
  }
}
