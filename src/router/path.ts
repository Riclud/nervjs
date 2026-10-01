export type ParamsOf<Path extends string> = Path extends `:${infer Name}`
  ? { [K in Name]: string }
  : Path extends `${infer Seg}/${infer Rest}`
    ? Seg extends `:${infer Name}`
      ? { [K in Name]: string } & ParamsOf<Rest>
      : ParamsOf<Rest>
    : Record<string, never>

export interface CompiledPath {
  pattern: RegExp
  keys: string[]
}

export const compilePath = (path: string): CompiledPath => {
  const keys: string[] = []
  const pattern = new RegExp(
    `^${path
      .split('/')
      .map((seg) => (seg.startsWith(':') ? (keys.push(seg.slice(1)), '([^/]+)') : seg))
      .join('/')}/?$`,
  )
  return { pattern, keys }
}

export const parseParams = (path: string, compiled: CompiledPath): Record<string, string> | null => {
  const match = compiled.pattern.exec(path)
  if (!match) return null
  const params: Record<string, string> = {}
  compiled.keys.forEach((key, i) => (params[key] = match[i + 1]!))
  return params
}
