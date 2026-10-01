export type PreHook<Ctx> = (ctx: Ctx) => void | Response | Promise<void | Response>
export type PostHook<Ctx> = (ctx: Ctx) => void | Response | Promise<void | Response>
export type OnError<Ctx> = (error: unknown, ctx: Ctx) => Response | Promise<Response>
