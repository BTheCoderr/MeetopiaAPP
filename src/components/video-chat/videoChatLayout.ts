/** Shared mobile-first layout tokens for /chat/video — same hierarchy on all breakpoints. */
export const videoChatLayout = {
  root: 'fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-black overscroll-none',
  mainVideo: 'absolute inset-0 h-full w-full object-cover object-center',
  header: 'fixed top-0 left-0 right-0 z-30',
  pip: 'fixed top-16 right-3 z-30 w-28 h-20 sm:w-36 sm:h-24 md:w-44 md:h-28 lg:w-52 lg:h-32 rounded-2xl overflow-hidden',
  messagePill:
    'fixed left-1/2 -translate-x-1/2 z-40 w-[calc(100vw-2rem)] max-w-md bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] md:bottom-28 pointer-events-none',
  controls:
    'fixed inset-x-0 z-40 px-2 bottom-[calc(env(safe-area-inset-bottom)+1rem)] md:bottom-8 transition-all duration-300',
  controlRow:
    'mx-auto flex w-full max-w-lg flex-wrap items-center justify-center gap-1.5 sm:gap-2.5',
  controlButton: 'w-10 h-10 sm:w-[46px] sm:h-[46px] md:w-[54px] md:h-[54px]',
  controlButtonPrimary: 'w-12 h-12 sm:w-[52px] sm:h-[52px] md:w-[60px] md:h-[60px]',
  statusChips: 'fixed top-16 left-3 sm:left-4 z-20 flex flex-wrap gap-2 max-w-[calc(100vw-8rem)]',
  safetyControls: 'fixed top-[calc(4rem+5.25rem)] sm:top-[calc(4rem+6.25rem)] md:top-[calc(4rem+7.25rem)] lg:top-[calc(4rem+8.25rem)] right-3 sm:right-4 z-20 flex gap-2',
  idleHint:
    'fixed inset-x-4 z-20 mx-auto w-auto max-w-xs text-center bottom-[calc(env(safe-area-inset-bottom)+11rem)] md:bottom-40 pointer-events-none',
} as const
