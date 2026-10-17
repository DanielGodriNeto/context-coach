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

export function handoffFor(feature: string, base: string, focus = 'Foque só nesta feature'): string {
  const f = feature.trim()
  return f === '' ? base : `${base} ${focus}: ${f}.`
}

export type Lang = 'pt' | 'en' | 'es'

const STOPWORDS: Record<Lang, string[]> = {
  pt: ['você', 'não', 'uma', 'para', 'com', 'que', 'isso', 'está', 'aí', 'então', 'pode', 'faz'],
  en: ['the', 'you', 'and', 'with', 'that', 'this', 'please', 'can', 'is', 'for', 'what', 'how'],
  es: ['usted', 'una', 'para', 'con', 'que', 'esto', 'está', 'puedes', 'por', 'los', 'cómo', 'qué'],
}

export function detectLang(text: string, fallback: Lang): Lang {
  const words = text.toLowerCase().match(/[\p{L}]+/gu) ?? []
  const score = (l: Lang) => words.filter(w => STOPWORDS[l].includes(w)).length
  const best = (['pt', 'en', 'es'] as const).reduce((a, b) => (score(b) > score(a) ? b : a), fallback)
  return score(best) > 0 ? best : fallback
}

export const TEXTS: Record<Lang, { handoff: string; compact: string; usage: string; label: string; placeholder: string; submit: string; prompt: string; focus: string }> = {
  pt: { handoff: 'Gerar handoff', compact: 'Compactar', usage: 'Ver uso', label: 'Handoff de uma feature:', placeholder: 'Escreva qual feature quer no handoff e dê Enter', submit: 'gerar',
    prompt: 'Faça o handoff: grave o resumo em HANDOFF-<projeto>.md (objetivo, arquivos alterados, comando de teste, decisões abertas, próximo passo) e me dê a frase pronta para colar na sessão nova.', focus: 'Foque só nesta feature' },
  en: { handoff: 'Create handoff', compact: 'Compact', usage: 'View usage', label: 'Handoff for one feature:', placeholder: 'Type which feature the handoff should cover, then Enter', submit: 'go',
    prompt: 'Do the handoff: write the summary to HANDOFF-<project>.md (goal, changed files, test command, open decisions, next step) and give me the ready-to-paste opening line for the new session.', focus: 'Focus only on this feature' },
  es: { handoff: 'Crear handoff', compact: 'Compactar', usage: 'Ver uso', label: 'Handoff de una feature:', placeholder: 'Escribe qué feature quieres en el handoff y pulsa Enter', submit: 'crear',
    prompt: 'Haz el handoff: guarda el resumen en HANDOFF-<proyecto>.md (objetivo, archivos cambiados, comando de prueba, decisiones abiertas, siguiente paso) y dame la frase lista para pegar en la sesión nueva.', focus: 'Enfócate solo en esta feature' },
}
