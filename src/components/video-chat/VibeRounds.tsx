'use client'

import type { VibeRoomState } from '@/lib/vibeRoom'

export default function VibeRounds({
  room, onAnswer, onNext,
}: { room: VibeRoomState | null; onAnswer: (choice: string) => void; onNext: () => void }) {
  if (!room) return null
  const options = room.round?.options || []
  const labelFor = (id: string) => options.find(option => option.id === id)?.label || 'Answered'
  return <section aria-label="The Vibe Room" className="fixed left-4 right-4 top-24 z-[65] mx-auto max-w-md rounded-[28px] border border-violet-400/50 bg-[#130f2c]/95 p-5 text-white shadow-2xl backdrop-blur-xl sm:left-auto sm:right-6">
    <p className="text-[10px] font-black tracking-[0.26em] text-violet-300">THE VIBE ROOM · {room.completed ? 'CHEMISTRY EXPLORED' : `${room.index + 1} OF ${room.total}`}</p>
    {room.completed ? <>
      <h2 className="mt-3 text-2xl font-black">You completed all three rounds.</h2>
      <p className="mt-3 text-sm leading-6 text-white/75">Feel a connection? Choose Vibe privately. Only mutual interest creates a saved Connection.</p>
    </> : <>
      <h2 className="mt-3 text-2xl font-black">{room.round?.title}</h2>
      <p className="mt-1 text-xs text-violet-200/80">{room.round?.subtitle}</p>
      <p className="mt-4 text-lg font-semibold leading-7">{room.round?.prompt}</p>
      {options.length > 0 && <div className="mt-4 space-y-2">
        {options.map(option => <button key={option.id} type="button" aria-pressed={room.myChoice === option.id} disabled={room.myChoice !== null || room.revealed} onClick={() => onAnswer(option.id)} className={`w-full rounded-xl border p-3 text-left text-sm font-semibold disabled:opacity-75 ${room.myChoice === option.id ? 'border-violet-200 bg-violet-600/50' : 'border-violet-400/30 bg-violet-500/15'}`}>{option.label}</button>)}
        {room.waitingForAnswer && <p className="text-xs text-violet-200">Your choice stays private until they choose.</p>}
        {room.revealed && room.reveal && <div className="mt-4 rounded-xl bg-violet-400/15 p-3"><p className="mb-2 text-xs font-black text-violet-200">THE REVEAL</p>{room.reveal.map(entry => <p key={entry.label} className="text-sm">{entry.label}: {labelFor(entry.choice)}</p>)}</div>}
      </div>}
      <button type="button" disabled={room.ready || (options.length > 0 && !room.revealed)} onClick={onNext} className="mt-5 w-full rounded-2xl bg-violet-500 p-3 text-sm font-bold disabled:opacity-45">{room.waitingForPartner ? 'Ready · waiting for them…' : room.index === 2 ? 'Finish the Vibe Room together' : 'Ready for next round'}</button>
    </>}
  </section>
}
