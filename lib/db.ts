import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { pgTable, text, timestamp, integer, boolean, varchar, uuid } from 'drizzle-orm/pg-core'

// Database connection
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Users table schema (for future use)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).unique(),
  email: varchar('email', { length: 255 }).unique(),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  is_banned: boolean('is_banned').default(false),
  preferences: text('preferences'), // JSON string for user preferences
})

// Chat messages table schema (for future use)
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  from_user_id: uuid('from_user_id'),
  to_user_id: uuid('to_user_id'),
  room_id: varchar('room_id', { length: 100 }),
  message: text('message').notNull(),
  message_type: varchar('message_type', { length: 20 }).default('text'), // 'text', 'image', etc.
  created_at: timestamp('created_at').defaultNow(),
  is_deleted: boolean('is_deleted').default(false),
})

// Reports table schema (for future use)
export const reports = pgTable('reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporter_id: uuid('reporter_id'),
  reported_user_id: uuid('reported_user_id'),
  reason: varchar('reason', { length: 100 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'reviewed', 'resolved'
  created_at: timestamp('created_at').defaultNow(),
  resolved_at: timestamp('resolved_at'),
})

// Sessions table schema (for analytics)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id'),
  session_start: timestamp('session_start').defaultNow(),
  session_end: timestamp('session_end'),
  duration_seconds: integer('duration_seconds'),
  features_used: text('features_used'), // JSON array of features used
  device_info: text('device_info'), // JSON object with device details
  created_at: timestamp('created_at').defaultNow(),
})

// Rooms table schema (for future private rooms feature)
export const rooms = pgTable('rooms', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  created_by: uuid('created_by'),
  is_private: boolean('is_private').default(false),
  max_participants: integer('max_participants').default(2),
  room_code: varchar('room_code', { length: 10 }).unique(),
  created_at: timestamp('created_at').defaultNow(),
  is_active: boolean('is_active').default(true),
})

// Database utility functions
export const dbUtils = {
  // Test database connection
  async testConnection() {
    try {
      const result = await sql`SELECT 1 as test`
      console.log('✅ Database connection successful:', result)
      return true
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
  },

  // Get database info
  async getDatabaseInfo() {
    try {
      const result = await sql`
        SELECT 
          current_database() as database_name,
          current_user as user_name,
          version() as version
      `
      return result[0]
    } catch (error) {
      console.error('Error getting database info:', error)
      return null
    }
  },

  // Future: Create a user
  async createUser(userData: {
    username?: string
    email?: string
    avatar_url?: string
  }) {
    try {
      // This would be implemented when we add user accounts
      console.log('User creation ready for:', userData)
      return { success: true, message: 'Database ready for user creation' }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error }
    }
  },

  // Future: Save a chat message
  async saveMessage(messageData: {
    from_user_id?: string
    to_user_id?: string
    room_id?: string
    message: string
  }) {
    try {
      // This would be implemented when we add message history
      console.log('Message saving ready for:', messageData)
      return { success: true, message: 'Database ready for message saving' }
    } catch (error) {
      console.error('Error saving message:', error)
      return { success: false, error }
    }
  }
} 