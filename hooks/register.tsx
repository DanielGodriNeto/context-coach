import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import { barOf, ctxLine, handoffFor, LIMIT_WARN, resetMessage } from './logic'

const HANDOFF_PROMPT =
  'Faça o handoff: grave o resumo em HANDOFF-<projeto>.md (objetivo, arquivos alterados, comando de teste, decisões abertas, próximo passo) e me dê a frase pronta para colar na sessão nova.'
const usage = atom({ plugin: 'context-coach', key: 'usage' } as const, { tokens: 0, five: null })

export const register: Register = on => {
  let isLimitWarned = false

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
        <Box gap={2}>
          <Button key="handoff" label="Gerar handoff" onPress={() => $.prompt.fill({ text: HANDOFF_PROMPT })} />
          <Button key="compact" label="Compactar" onPress={() => $.prompt.fill({ text: '/compact' })} />
          <Button key="usage" label="Ver uso" onPress={() => $.prompt.fill({ text: '/usage' })} />
          <Input key="feature" label="Handoff da feature:" placeholder="ex.: login com Google" submitLabel="gerar" onSubmit={value => $.prompt.fill({ text: handoffFor(value, HANDOFF_PROMPT) })} />
        </Box>
      </Box>
    )
  })
}
