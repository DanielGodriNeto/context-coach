import { expect, test } from 'claude-code/testing'

import { barOf, ctxLine, detectLang, handoffFor, resetMessage } from './logic'

test('half a lap is 50% blue over gray', () => {
  expect(barOf(75_000)).toEqual({ lap: 1, pct: 50, fill: 'blue', rest: 'gray' })
})
test('second lap: green over blue', () => {
  expect(barOf(225_000)).toEqual({ lap: 2, pct: 50, fill: 'green', rest: 'blue' })
})
test('status line', () => {
  expect(ctxLine(132_400, 40.2)).toBe('ctx 132k · 5h 40%')
  expect(ctxLine(5_000, null)).toBe('ctx 5k')
})
test('reset message escalates', () => {
  expect(resetMessage(30_000)).toContain('Faltam')
  expect(resetMessage(140_000)).toContain('Perto')
  expect(resetMessage(200_000)).toContain('hora de continuar')
})
test('handoff of a feature appends the focus', () => {
  expect(handoffFor('login', 'Base.')).toBe('Base. Foque só nesta feature: login.')
  expect(handoffFor('  ', 'Base.')).toBe('Base.')
})
test('detects the user language', () => {
  expect(detectLang('can you please fix this for me', 'pt')).toBe('en')
  expect(detectLang('você pode fazer isso para mim', 'en')).toBe('pt')
  expect(detectLang('puedes hacer esto por mí', 'pt')).toBe('es')
  expect(detectLang('ok', 'en')).toBe('en')
})
