import { z, type ZodTypeAny } from 'zod'

export const loadConfig = <S extends ZodTypeAny>(
  schema: S,
  source: Record<string, unknown> = process.env as Record<string, unknown>,
): z.infer<S> => {
  const parsed = schema.safeParse(source)
  if (!parsed.success) {
    throw new Error(
      `Invalid configuration:\n${parsed.error.issues
        .map((issue) => `  ${issue.path.join('.') || '(config)'}: ${issue.message}`)
        .join('\n')}`,
    )
  }
  return parsed.data
}
