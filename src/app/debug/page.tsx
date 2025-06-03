'use client'
import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export default function DebugPage() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [connectionDetails, setConnectionDetails] = useState<any>({})

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'
    addLog(`Attempting connection to: ${socketUrl}`)
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 15000,
    })

    setSocket(newSocket)

    newSocket.on('connect', () => {
      addLog('✅ Socket connected successfully')
      addLog(`Socket ID: ${newSocket.id}`)
      addLog(`Transport: ${newSocket.io.engine.transport.name}`)
      addLog(`Connected to server successfully`)
      setIsConnected(true)
      
      // Get detailed connection info
      setConnectionDetails({
        socketId: newSocket.id,
        transport: newSocket.io.engine.transport.name,
        connected: newSocket.connected,
        disconnected: newSocket.disconnected
      })
    })

    newSocket.on('connect_error', (err: any) => {
      addLog(`❌ Connection error: ${err.message}`)
      addLog(`Error type: ${err.name}`)
      addLog(`Error details: ${err.description || err.code || 'N/A'}`)
      setIsConnected(false)
    })

    newSocket.on('disconnect', (reason) => {
      addLog(`🔌 Disconnected: ${reason}`)
      setIsConnected(false)
    })

    newSocket.on('waiting', (data) => {
      addLog(`⏳ Server response - waiting: ${JSON.stringify(data)}`)
    })

    newSocket.on('match-found', (data) => {
      addLog(`🎉 Match found: ${JSON.stringify(data)}`)
      setIsSearching(false)
    })

    // Add ping/pong monitoring
    newSocket.on('pong', (data) => {
      addLog(`🏓 Pong received: ${JSON.stringify(data)}`)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [])

  const testSearch = () => {
    if (!socket || !isConnected) {
      addLog('❌ Cannot search - not connected')
      return
    }

    setIsSearching(true)
    addLog('🔍 Starting search test...')
    addLog(`Current socket state: connected=${socket.connected}, id=${socket.id}`)
    
    socket.emit('find-match', { type: 'video' }, (response: any) => {
      addLog(`📝 Server acknowledgment: ${JSON.stringify(response)}`)
      if (response?.status === 'error') {
        addLog(`❌ Server returned error: ${response.message}`)
        setIsSearching(false)
      }
    })

    // Test timeout
    setTimeout(() => {
      if (isSearching) {
        addLog('⏰ Search test timeout (10s) - checking connection...')
        if (socket.connected) {
          addLog('🔍 Socket still connected - server may be slow to respond')
        } else {
          addLog('❌ Socket disconnected during search')
        }
        setIsSearching(false)
      }
    }, 10000)
  }

  const testPing = () => {
    if (!socket || !isConnected) {
      addLog('❌ Cannot ping - not connected')
      return
    }

    addLog('🏓 Sending ping...')
    socket.emit('ping', { timestamp: Date.now() }, (response: any) => {
      addLog(`🏓 Ping response: ${JSON.stringify(response)}`)
    })
  }

  const clearLogs = () => {
    setLogs([])
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Meetopia Connection Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-semibold">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            <button
              onClick={testSearch}
              disabled={!isConnected || isSearching}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              {isSearching ? 'Searching...' : 'Test Search'}
            </button>
            <button
              onClick={testPing}
              disabled={!isConnected}
              className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
            >
              Test Ping
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Clear Logs
            </button>
          </div>

          {isConnected && connectionDetails.socketId && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
              <h3 className="font-semibold text-green-800 mb-2">Connection Details</h3>
              <div className="text-sm space-y-1">
                <div><strong>Socket ID:</strong> {connectionDetails.socketId}</div>
                <div><strong>Transport:</strong> {connectionDetails.transport}</div>
                <div><strong>Status:</strong> {connectionDetails.connected ? 'Connected' : 'Disconnected'}</div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">Waiting for logs...</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Socket URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3003'}</div>
            <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
            <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</div>
            <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
            <div><strong>Is Mobile:</strong> {typeof window !== 'undefined' ? (window.innerWidth < 768 ? 'Yes' : 'No') : 'N/A'}</div>
            <div><strong>Connection Type:</strong> {typeof navigator !== 'undefined' && 'connection' in navigator ? (navigator as any).connection?.effectiveType || 'Unknown' : 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  )
} 