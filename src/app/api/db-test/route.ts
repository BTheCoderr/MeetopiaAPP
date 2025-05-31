import { dbUtils } from '../../../../lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
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
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 