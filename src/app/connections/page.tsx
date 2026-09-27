'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/Layout/MainLayout'

type ConnectionPerson = {
  id: string
  username: string
  displayName: string | null
}

type Connection = {
  id: string
  createdAt: string
  person: ConnectionPerson
}

export default function ConnectionsPage() {
  const router = useRouter()
  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadConnections = async () => {
      try {
        const response = await fetch('/api/connections', { cache: 'no-store' })
        if (response.status === 401) {
          router.replace('/auth/signin?next=/connections')
          return
        }

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Could not load Connections.')
        setConnections(data.connections || [])
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load Connections.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadConnections()
  }, [router])

  const blockPerson = async (person: ConnectionPerson) => {
    const name = person.displayName || person.username
    if (!window.confirm(`Block ${name}? You will not be matched with them again.`)) return

    const response = await fetch('/api/blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockedUserId: person.id }),
    })

    if (response.ok) {
      setConnections(current => current.filter(connection => connection.person.id !== person.id))
      return
    }

    const data = await response.json()
    setError(data.error || 'Could not block this person.')
  }

  return (
    <MainLayout>
      <section className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600">Both of you chose it</p>
            <h1 className="mt-1 text-4xl font-black text-gray-950">Connections</h1>
            <p className="mt-2 max-w-2xl text-gray-600">
              Nobody appears here because an algorithm guessed. A Connection is saved only after you talked live and both tapped Vibe.
            </p>
          </div>
          <Link
            href="/start"
            className="rounded-xl bg-gray-950 px-5 py-3 text-center font-semibold text-white hover:bg-gray-800"
          >
            Start another Chemistry Check
          </Link>
        </div>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

        {isLoading ? (
          <div className="rounded-2xl bg-white p-8 text-gray-500 shadow-sm">Loading Connections…</div>
        ) : connections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <div className="text-4xl">♥</div>
            <h2 className="mt-3 text-xl font-bold text-gray-900">No Connections yet</h2>
            <p className="mx-auto mt-2 max-w-md text-gray-600">
              Talk to someone first. If you both Vibe, you will find each other here afterward.
            </p>
            <Link
              href="/start"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Start talking
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {connections.map(connection => {
              const person = connection.person
              const name = person.displayName || person.username

              return (
                <article key={connection.id} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-950 text-xl font-black text-white">
                      {name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-950">{name}</h2>
                      <p className="text-xs text-gray-400">
                        Connected {new Date(connection.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-sm text-gray-600">
                    You met live first and both chose to keep the connection.
                  </p>

                  <button
                    onClick={() => void blockPerson(person)}
                    className="mt-5 text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    Block & remove
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </MainLayout>
  )
}
