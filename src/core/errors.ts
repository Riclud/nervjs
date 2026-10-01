import type { ZodError } from 'zod'

export interface ValidationIssue {
  path: string
  message: string
}

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }

  toResponse = (): Response => jsonResponse(this.status, { error: this.message })
}

export const normalizeIssues = (error: ZodError): ValidationIssue[] =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))

export const validationResponse = (issues: ValidationIssue[]): Response =>
  jsonResponse(400, { error: 'validation', issues })

export const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
