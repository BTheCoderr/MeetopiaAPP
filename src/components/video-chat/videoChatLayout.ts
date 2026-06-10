/** Shared mobile-first layout tokens for /chat/video — same hierarchy on all breakpoints. */
export const videoChatLayout = {
  root: 'relative min-h-[100dvh] h-[100dvh] w-full overflow-x-hidden overflow-y-hidden bg-black',
  mainVideo: 'absolute inset-0 h-full w-full object-cover',
  header: 'fixed top-0 left-0 right-0 z-30',
  pip: 'fixed top-16 right-3 z-30 w-28 h-20 sm:w-36 sm:h-24 md:w-44 md:h-28 lg:w-52 lg:h-32 rounded-2xl overflow-hidden',
  messagePill:
    'fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-2rem)] max-w-md bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] md:bottom-28 pointer-events-none',
  controls:
    'fixed left-1/2 -translate-x-1/2 z-40 bottom-[calc(env(safe-area-inset-bottom)+1rem)] md:bottom-8 transition-all duration-300',
  controlRow: 'flex items-center justify-center gap-2 sm:gap-2.5 max-w-[100vw]',
  controlButton: 'w-[46px] h-[46px] md:w-[54px] md:h-[54px]',
  controlButtonPrimary: 'w-[52px] h-[52px] md:w-[60px] md:h-[60px]',
  statusChips: 'fixed top-16 left-3 sm:left-4 z-20 flex flex-wrap gap-2 max-w-[calc(100vw-8rem)]',
  safetyControls: 'fixed top-[calc(4rem+5.25rem)] sm:top-[calc(4rem+6.25rem)] md:top-[calc(4rem+7.25rem)] lg:top-[calc(4rem+8.25rem)] right-3 sm:right-4 z-20 flex gap-2',
  idleHint:
    'fixed left-1/2 -translate-x-1/2 z-20 w-[calc(100vw-2rem)] max-w-xs text-center bottom-[calc(env(safe-area-inset-bottom)+11rem)] md:bottom-40 pointer-events-none',
} as const
