import 'next-auth'
import { JWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      phone?: string | null
      username: string
    }
  }

  interface User {
    id: string
    email?: string | null
    phone?: string | null
    username: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email?: string | null
    phone?: string | null
    username: string
  }
} 