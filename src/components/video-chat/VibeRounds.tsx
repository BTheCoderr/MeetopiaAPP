'use client'
import type { VibeRoomState } from '@/lib/vibeRoom'

export default function VibeRounds({ room, onAnswer, onNext, onContribute, onApprove }: {
  room: VibeRoomState | null
  onAnswer: (choice: string) => void
  onNext: () => void
  onContribute: (choice: string) => void
  onApprove: () => void
}) {
  if (!room) return null
  const options = room.round?.options || []
  const labelFor = (id: string) => options.find(o => o.id === id)?.label || 'Answered'
  const bridge = room.bridge
  return <section aria-label="Meetopia Vibe Room" className="fixed left-4 right-4 top-20 z-[65] mx-auto max-w-md rounded-[26px] border border-violet-400/50 bg-[#130f2c]/95 p-5 text-white shadow-2xl backdrop-blur-xl sm:left-auto sm:right-6">
    <p className="text-[10px] font-black tracking-[0.2em] text-violet-300">{room.themeTitle.toUpperCase()} · {room.completed ? 'SHARED EXPERIENCE' : `${room.index + 1} OF ${room.total}`}</p>
    {room.completed ? <>
      <h2 className="mt-3 text-2xl font-black">You made something together.</h2>
      <p className="mt-3 text-sm leading-6 text-white/75">Both approved your shared adventure. Privately choose Vibe when you're ready. Only mutual interest creates a Connection and saves your joint idea.</p>
    </> : <>
      <h2 className="mt-3 text-2xl font-black">{room.round?.title}</h2>
      <p className="mt-1 text-xs text-violet-200/80">{room.round?.subtitle}</p>
      <p className="mt-4 text-lg font-semibold leading-7">{room.round?.prompt}</p>
      {bridge ? <>
        <p className="mt-5 text-xs font-extrabold tracking-widest text-violet-200">YOUR CONTRIBUTION: {bridge.role === 'activity' ? 'THE ACTIVITY' : 'THE SETTING'}</p>
        <div className="mt-3 space-y-2">{bridge.options.map(option =>
          <button key={option.id} type="button" aria-pressed={bridge.myChoice === option.id} onClick={() => onContribute(option.id)} className={`w-full rounded-xl border p-3 text-left text-sm font-semibold ${bridge.myChoice === option.id ? 'border-violet-200 bg-violet-500/50' : 'border-violet-400/30 bg-violet-500/15'}`}>{bridge.myChoice === option.id ? '✓ ' : '+ '}{option.label}</button>
        )}</div>
        {bridge.waitingForPartner && <p className="mt-3 text-xs text-violet-200">Your idea is private until both participants contribute.</p>}
        {bridge.proposalLabels && <div className="mt-5 rounded-2xl border border-violet-300/60 bg-violet-500/20 p-4">
          <p className="text-xs font-black tracking-wider text-violet-200">✦ YOUR FIRST SHARED ADVENTURE</p>
          <h3 className="mt-3 text-xl font-black">{bridge.proposalLabels.activity}</h3>
          <p className="mt-2 text-sm">{bridge.proposalLabels.setting}</p>
          <p className="mt-3 text-xs leading-5 text-violet-100/70">Either person can revise their contribution. A change clears previous approvals.</p>
          <button type="button" disabled={bridge.approved} onClick={onApprove} className="mt-4 w-full rounded-2xl bg-violet-500 p-3 text-sm font-black disabled:opacity-50">{bridge.approved ? 'Approved · waiting for them…' : 'Approve & share if we both Vibe'}</button>
          {bridge.otherApproved && <p className="mt-2 text-xs text-violet-200">They approved this version. It's still your choice.</p>}
        </div>}
      </> : <>
        {options.length > 0 && <div className="mt-4 space-y-2">
          {options.map(option => <button key={option.id} type="button" aria-pressed={room.myChoice === option.id} disabled={room.myChoice !== null || room.revealed} onClick={() => onAnswer(option.id)} className={`w-full rounded-xl border p-3 text-left text-sm font-semibold disabled:opacity-70 ${room.myChoice === option.id ? 'border-violet-200 bg-violet-600/50' : 'border-violet-400/30 bg-violet-500/15'}`}>{option.label}</button>)}
          {room.waitingForAnswer && <p className="text-xs text-violet-200">Your answer stays private until they choose.</p>}
          {room.revealed && room.reveal && <div className="mt-3 rounded-xl bg-violet-400/15 p-3"><p className="mb-2 text-xs font-black text-violet-200">THE REVEAL</p>{room.reveal.map(entry => <p key={entry.label} className="text-sm">{entry.label}: {labelFor(entry.choice)}</p>)}</div>}
        </div>}
        <button type="button" disabled={room.ready || (options.length > 0 && !room.revealed)} onClick={onNext} className="mt-5 w-full rounded-2xl bg-violet-500 p-3 text-sm font-black disabled:opacity-45">{room.waitingForPartner ? 'Ready · waiting for them…' : room.index === 2 ? 'Create something together' : 'Ready for next round'}</button>
      </>}
    </>}
  </section>
}
