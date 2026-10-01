import { z, type ZodType } from 'zod'

type ConfigShape = Record<string, unknown>

type ConfigValue<T extends ConfigShape> = {
  [K in keyof T]: T[K] extends { env: string; schema: ZodType }
    ? z.infer<T[K]['schema']>
    : T[K] extends ZodType
      ? z.infer<T[K]>
      : string
}

const toEnvKey = (key: string): string => key.replace(/[A-Z]/g, (ch) => `_${ch}`).toUpperCase()

export const defineConfig = <T extends ConfigShape>(
  shape: T,
  source: Record<string, unknown> = process.env as Record<string, unknown>,
): ConfigValue<T> => {
  const result = {} as ConfigValue<T>
  const issues: string[] = []

  for (const [key, entry] of Object.entries(shape)) {
    const hasSafeParse = typeof (entry as { safeParse?: unknown } | null)?.safeParse === 'function'

    if (entry && typeof entry === 'object' && !hasSafeParse && 'env' in entry && 'schema' in entry) {
      const { env: envKey, schema } = entry as { env: string; schema: ZodType }
      const parsed = schema.safeParse(source[envKey])
      if (parsed.success) {
        result[key as keyof T] = parsed.data as never
      } else {
        issues.push(`  ${envKey} (${key}): ${parsed.error.issues.map((i) => i.message).join(', ')}`)
      }
      continue
    }

    const envKey = toEnvKey(key)
    const raw = source[envKey]

    if (hasSafeParse) {
      const parsed = (entry as ZodType).safeParse(raw)
      if (parsed.success) {
        result[key as keyof T] = parsed.data as never
      } else {
        issues.push(`  ${envKey} (${key}): ${parsed.error.issues.map((i) => i.message).join(', ')}`)
      }
    } else {
      result[key as keyof T] = (raw ?? entry) as never
    }
  }

  if (issues.length) throw new Error(`Invalid configuration:\n${issues.join('\n')}`)
  return result
}
