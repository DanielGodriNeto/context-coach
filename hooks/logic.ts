export const RESET_AT = 150_000
export const LIMIT_WARN = 80

const LAP_COLORS = ['blue', 'green', 'yellow', 'red']
export const lapsOf = (tokens: number): number => tokens / RESET_AT
const k = (n: number) => `${Math.round(n / 1000)}k`

export function ctxLine(tokens: number, five: number | null): string {
  return five === null ? `ctx ${k(tokens)}` : `ctx ${k(tokens)} · 5h ${Math.round(five)}%`
}

export type Bar = { lap: number; pct: number; fill: string; rest: string }

/** Progress inside the current 150k lap; the unfilled rest shows the previous lap's color (gray on the first). */
export function barOf(tokens: number): Bar {
  const laps = Math.min(lapsOf(tokens), 4)
  const lap = Math.min(Math.floor(laps), 3)
  const pct = laps >= 4 ? 100 : Math.round((laps - lap) * 100)
  return { lap: lap + 1, pct, fill: LAP_COLORS[lap], rest: lap > 0 ? LAP_COLORS[lap - 1] : 'gray' }
}

export function resetMessage(tokens: number): string {
  const laps = lapsOf(tokens)
  if (laps < 0.8) return `Faltam ${k(RESET_AT - tokens)} para o reset`
  if (laps < 1) return 'Perto do limite: prepare o handoff'
  return `Passou de ${k(RESET_AT)} (${laps.toFixed(1)}x): hora de continuar em sessão nova`
}

export function handoffFor(feature: string, base: string): string {
  const f = feature.trim()
  return f === '' ? base : `${base} Foque só nesta feature: ${f}.`
}
