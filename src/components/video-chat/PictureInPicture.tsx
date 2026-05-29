'use client'

export interface PictureInPictureProps {
  localVideoRef: React.RefObject<HTMLVideoElement | null>
  pipStream?: MediaStream | null
  areControlsVisible: boolean
  isCameraOff: boolean
}

function isVideoTrackInactive(stream: MediaStream | null): boolean {
  if (!stream) return true
  const track = stream.getVideoTracks()[0]
  if (!track) return true
  return track.readyState === 'ended' || !track.enabled || track.muted
}

const isDev = process.env.NODE_ENV === 'development'

export default function PictureInPicture({
  localVideoRef,
  pipStream = null,
  areControlsVisible,
  isCameraOff,
}: PictureInPictureProps) {
  if (!pipStream) return null

  const pipPaused = isCameraOff || isVideoTrackInactive(pipStream)

  return (
    <div
      className={`fixed top-[calc(3.75rem+env(safe-area-inset-top))] right-3 sm:right-4 z-20 w-[7.5rem] sm:w-[9.5rem] md:w-[11rem] aspect-video rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/25 transition-opacity duration-300 ${
        areControlsVisible ? 'opacity-100' : 'opacity-90'
      }`}
    >
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover -scale-x-100 ${pipPaused ? 'opacity-0' : 'opacity-100'}`}
      />
      {pipPaused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1c1c1e] gap-1">
          <svg className="w-6 h-6 text-white/35" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.55-.18L19.73 21 21 19.73 3.27 2z" />
          </svg>
          <span className="text-[10px] text-white/50 font-medium">Camera paused</span>
        </div>
      )}
      {isDev && (
        <div className="absolute bottom-1 left-1 pointer-events-none px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white/90">
          PIP: LOCAL
        </div>
      )}
    </div>
  )
}
