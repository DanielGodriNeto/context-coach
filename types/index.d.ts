declare module 'claude-code' {
  interface PluginState {
    'context-coach': { usage: { tokens: number; five: number | null } }
  }
}
