'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MainLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/start', label: 'Start' },
  { href: '/connections', label: 'Connections' },
]

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
            <span className="text-2xl font-black tracking-tight sm:text-[1.7rem]">
              <span className="text-blue-600">Meet</span>
              <span className="text-gray-950">opia</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex" aria-label="Primary navigation">
            {navItems.map(item => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-gray-950 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen(open => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 sm:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {menuOpen ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>

        {menuOpen && (
          <nav className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 sm:hidden" aria-label="Mobile navigation">
            <div className="mx-auto grid max-w-6xl gap-1">
              {navItems.map(item => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                      active ? 'bg-gray-950 text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-950">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-950">Terms</Link>
            <Link href="/community-guidelines" className="hover:text-gray-950">Guidelines</Link>
            <Link href="/support" className="hover:text-gray-950">Support</Link>
            <Link href="/safety" className="hover:text-gray-950">Safety</Link>
          </nav>
          <p className="mt-3 text-center text-xs text-gray-400 sm:text-sm">
            © {new Date().getFullYear()} Meetopia — Talk first. Vibe after.
          </p>
        </div>
      </footer>
    </div>
  )
}
