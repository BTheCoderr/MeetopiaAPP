import { randomBytes } from 'crypto'
import { NextRequest } from 'next/server'
import { prisma } from '../prisma'

export const NATIVE_CLIENT_HEADER = 'x-meetopia-client'
export const NATIVE_CLIENT_VALUE = 'native'

export async function createSession(userId: string) {
  const sessionId = randomBytes(32).toString('hex')

  return prisma.session.create({
    data: {
      id: sessionId,
      userId,
      token: randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
}

export async function getSession(sessionId: string) {
  return prisma.session.findFirst({
    where: {
      id: sessionId,
      expiresAt: { gt: new Date() },
    },
  })
}

export async function getSessionByToken(token: string) {
  return prisma.session.findFirst({
    where: {
      token,
      expiresAt: { gt: new Date() },
    },
  })
}

export function parseBearerToken(authorization: string | null | undefined): string | null {
  if (!authorization) return null
  const match = authorization.match(/^Bearer\s+(\S+)/i)
  return match?.[1] ?? null
}

export function isNativeClient(request: Pick<Request, 'headers'>): boolean {
  return request.headers.get(NATIVE_CLIENT_HEADER)?.trim().toLowerCase() === NATIVE_CLIENT_VALUE
}

export async function getRequestSession(request: NextRequest) {
  const cookieId = request.cookies.get('meetopia_session')?.value
  if (cookieId) {
    const session = await getSession(cookieId)
    if (session) return session
  }

  const token = parseBearerToken(request.headers.get('authorization'))
  if (token) {
    return getSessionByToken(token)
  }

  return null
}

export async function deleteSession(sessionId: string) {
  await prisma.session.delete({
    where: { id: sessionId },
  })
}
