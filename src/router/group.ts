import type { Route } from './factory.ts'

export interface GroupOptions {
  prefix: string
  tag?: string
  routes: Route[]
}

export const group = ({ prefix, tag, routes }: GroupOptions): Route[] =>
  routes.map((route) => {
    const path = [prefix.replace(/^\/+|\/+$/g, ''), route.path.replace(/^\/+|\/+$/g, '')].filter(Boolean).join('/')
    return {
      ...route,
      path,
      tag: route.tag ?? tag,
    }
  })
