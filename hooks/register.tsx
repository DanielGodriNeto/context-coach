import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { barOf, ctxLine, detectLang, handoffFor, LIMIT_WARN, resetMessage, TEXTS } from './logic'
import type { Lang } from './logic'

const usage = atom({ plugin: 'context-coach', key: 'usage' } as const, { tokens: 0, five: null })

export const register: Register = on => {
  let isLimitWarned = false
  let lang: Lang = 'pt'

  on('prompt.submit', async ($, e, next) => {
    lang = detectLang(e.text, lang)
    return next(e)
  }).catch(($, e, next) => next(e))

  on('turn.complete', async ($, e, next) => {
    const { context, rateLimits } = await $.session.usage()
    const tokens = context.tokens ?? 0
    const five = rateLimits.find(r => r.kind === 'five_hour')?.percentUsed ?? null
    await update($, usage, () => ({ tokens, five }))
    $.ui.status(ctxLine(tokens, five))
    if (!isLimitWarned && (five ?? 0) >= LIMIT_WARN) {
      isLimitWarned = true
      $.ui.toast(`Limite de 5h em ${Math.round(five ?? 0)}%`)
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const { tokens, five } = await read($, usage)
    const { Box, Button, Input, Text } = $.ui.resolve(e)
    const bar = barOf(tokens)
    const t = TEXTS[lang]
    return (
      <Box flexDirection="column" width="100%">
        <Box>
          <Text bold>{ctxLine(tokens, five)}</Text>
          <Text dimColor>  ·  volta {bar.lap}  ·  {resetMessage(tokens)}</Text>
        </Box>
        <Box width="100%">
          <Box flexGrow={bar.pct} backgroundColor={bar.fill}><Text> </Text></Box>
          <Box flexGrow={100 - bar.pct} backgroundColor={bar.rest}><Text> </Text></Box>
        </Box>
        <Box width="100%" justifyContent="space-between">
          <Text dimColor>0%</Text>
          <Text dimColor>25%</Text>
          <Text dimColor>50%</Text>
          <Text dimColor>75%</Text>
          <Text dimColor>100%</Text>
        </Box>
        <Box width="100%" justifyContent="space-between">
          <Button key="handoff" label={t.handoff} onPress={() => $.prompt.fill({ text: t.prompt })} />
          <Button key="compact" label={t.compact} onPress={() => $.prompt.fill({ text: '/compact' })} />
          <Button key="usage" label={t.usage} onPress={() => $.prompt.fill({ text: '/usage' })} />
          <Box flexGrow={1} marginLeft={2}>
            <Input key="feature" label={t.label} placeholder={t.placeholder} submitLabel={t.submit} onSubmit={value => $.prompt.fill({ text: handoffFor(value, t.prompt, t.focus) })} />
          </Box>
        </Box>
      </Box>
    )
  })
}
