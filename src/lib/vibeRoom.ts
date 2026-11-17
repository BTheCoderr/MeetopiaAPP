// Shared client-facing contract for authenticated, server-synchronized Vibe Rounds.
export type VibeRoomState = {
  sessionId: string
  index: number
  total: 3
  completed: boolean
  round: null | {
    id: string
    title: string
    subtitle: string
    prompt: string
    options?: { id: string; label: string }[]
  }
  ready: boolean
  waitingForPartner: boolean
  myChoice: string | null
  waitingForAnswer: boolean
  revealed: boolean
  reveal: { label: string; choice: string }[] | null
}
