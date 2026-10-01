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

  toResponse(): Response {
    return jsonResponse(this.status, { error: this.message })
  }
}

export function normalizeIssues(error: ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}

export function validationResponse(issues: ValidationIssue[]): Response {
  return jsonResponse(400, { error: 'validation', issues })
}

export function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
