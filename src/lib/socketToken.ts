import { createHmac, timingSafeEqual } from 'crypto'

type SocketTokenPayload = {
  sub: string
  exp: number
  displayName?: string | null
  adultConfirmed?: boolean
  blocked?: string[]
}

type ConnectionProofPayload = {
  type: 'connection'
  users: [string, string]
  exp: number
}

type DirectCallProofPayload = {
  type: 'direct-call'
  callerId: string
  calleeId: string
  connectionId: string
  exp: number
}

type ConnectionRealtimeProofPayload = {
  type: 'connection-realtime'
  users: [string, string]
  connectionId: string
  exp: number
}

function secret() {
  const value = process.env.SOCKET_AUTH_SECRET
  if (!value) throw new Error('SOCKET_AUTH_SECRET is not configured')
  return value
}

function encode(value: object) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function signature(body: string) {
  return createHmac('sha256', secret()).update(body).digest('base64url')
}

function verify<T>(token: string): T | null {
  const [body, providedSignature] = token.split('.')
  if (!body || !providedSignature) return null

  const expected = signature(body)
  const a = Buffer.from(providedSignature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T
  } catch {
    return null
  }
}

export function createSocketToken(payload: Omit<SocketTokenPayload, 'exp'>) {
  const body = encode({ ...payload, exp: Date.now() + 5 * 60 * 1000 })
  return `${body}.${signature(body)}`
}

export function verifyConnectionProof(token: string) {
  const payload = verify<ConnectionProofPayload>(token)
  if (!payload || payload.type !== 'connection' || payload.exp < Date.now()) return null
  if (!Array.isArray(payload.users) || payload.users.length !== 2) return null
  return payload
}


export function createDirectCallProof(payload: Omit<DirectCallProofPayload, 'type' | 'exp'>) {
  const body = encode({
    type: 'direct-call',
    ...payload,
    exp: Date.now() + 2 * 60 * 1000,
  })
  return `${body}.${signature(body)}`
}

export function verifyDirectCallProof(token: string) {
  const payload = verify<DirectCallProofPayload>(token)
  if (!payload || payload.type !== 'direct-call' || payload.exp < Date.now()) return null
  if (!payload.callerId || !payload.calleeId || !payload.connectionId) return null
  return payload
}


export function createConnectionRealtimeProof(
  userIdA: string,
  userIdB: string,
  connectionId: string,
) {
  const users = [userIdA, userIdB].sort() as [string, string]
  const body = encode({
    type: 'connection-realtime',
    users,
    connectionId,
    exp: Date.now() + 60 * 60 * 1000,
  })
  return `${body}.${signature(body)}`
}

export function verifyConnectionRealtimeProof(token: string) {
  const payload = verify<ConnectionRealtimeProofPayload>(token)
  if (!payload || payload.type !== 'connection-realtime' || payload.exp < Date.now()) return null
  if (!Array.isArray(payload.users) || payload.users.length !== 2 || !payload.connectionId) return null
  return payload
}
