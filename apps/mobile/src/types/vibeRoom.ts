export type VibeRoomOption = { id: string; label: string }
export type VibeRound = {
  id: string
  title: string
  subtitle: string
  prompt: string
  options?: VibeRoomOption[]
}
export type VibeRoomState = {
  sessionId: string
  index: number
  total: 3
  completed: boolean
  round: VibeRound | null
  ready: boolean
  waitingForPartner: boolean
  myChoice: string | null
  waitingForAnswer: boolean
  revealed: boolean
  reveal: { label: 'You' | 'Them'; choice: string }[] | null
}
