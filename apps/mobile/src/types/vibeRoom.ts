export type VibeRoomOption = { id: string; label: string }
export type VibeRound = {
  id: string
  title: string
  subtitle: string
  prompt: string
  options?: VibeRoomOption[]
}
export type BridgeState = {
  role: 'activity' | 'setting'
  options: VibeRoomOption[]
  myChoice: string | null
  waitingForPartner: boolean
  proposal: { activity: string; setting: string } | null
  proposalLabels: { activity: string; setting: string } | null
  revision: number
  approved: boolean
  otherApproved: boolean
}
export type SharedCreation = { themeId: string; activity: string; setting: string }
export type VibeRoomState = {
  sessionId: string
  themeId: string
  themeTitle: string
  index: number
  total: number
  completed: boolean
  round: VibeRound | null
  ready: boolean
  waitingForPartner: boolean
  myChoice: string | null
  waitingForAnswer: boolean
  revealed: boolean
  reveal: { label: 'You' | 'Them'; choice: string }[] | null
  bridge: BridgeState | null
  finalCreation: SharedCreation | null
}
