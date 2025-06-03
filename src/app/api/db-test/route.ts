import { NextResponse } from 'next/server'

// Force dynamic runtime to prevent static generation issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    // Check if database URL is properly configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        status: 'warning',
        message: 'Database URL not configured',
        database: {
          connected: false,
          info: 'No database URL provided',
          ready_for: []
        }
      }, { status: 200 })
    }

    // Dynamically import db utils to prevent build-time errors
    const { dbUtils } = await import('../../../../lib/db')

    // Test the database connection
    const isConnected = await dbUtils.testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      )
    }

    // Get database information
    const dbInfo = await dbUtils.getDatabaseInfo()

    return NextResponse.json({
      status: 'success',
      message: 'Database connected successfully! 🎉',
      database: {
        connected: true,
        info: dbInfo,
        ready_for: [
          'User accounts & profiles',
          'Chat message history', 
          'Reporting system',
          'Session analytics',
          'Private rooms'
        ]
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        database: {
          connected: false,
          info: 'Connection error',
          ready_for: []
        }
      },
      { status: 500 }
    )
  }
} 