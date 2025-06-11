import { NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-middleware';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const prisma = new PrismaClient();

// =====================================
// GET /api/admin/stats - Get platform statistics
// =====================================

async function getAdminStats(request: AuthenticatedRequest) {
  try {
    // Check if user is admin (you can implement proper role checking)
    // For now, we'll allow any authenticated user to access admin stats
    // In production, you'd check: if (request.user.role !== 'ADMIN') throw new Error('Unauthorized')

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Get all statistics in parallel
    const [
      totalUsers,
      activeUsersToday,
      totalMeetings,
      activeMeetings,
      totalMessages,
      meetingDurations,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active users today (users who created sessions today)
      prisma.session.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
        distinct: ['userId'],
      }),
      
      // Total meetings
      prisma.meeting.count(),
      
      // Active meetings (currently ongoing)
      prisma.meeting.count({
        where: {
          status: 'ACTIVE',
        },
      }),
      
      // Total chat messages
      prisma.chatMessage.count(),
      
      // Meeting durations for average calculation
      prisma.meeting.findMany({
        where: {
          endTime: {
            not: null,
          },
          startTime: {
            not: null,
          },
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
    ]);

    // Calculate average meeting duration in minutes
    let averageMeetingDuration = 0;
    if (meetingDurations.length > 0) {
      const totalDuration = meetingDurations.reduce((sum, meeting) => {
        if (meeting.startTime && meeting.endTime) {
          const duration = meeting.endTime.getTime() - meeting.startTime.getTime();
          return sum + duration;
        }
        return sum;
      }, 0);
      
      averageMeetingDuration = Math.round(totalDuration / meetingDurations.length / (1000 * 60)); // Convert to minutes
    }

    // Determine system health based on various factors
    let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (activeMeetings > 50) {
      systemHealth = 'warning';
    }
    if (activeMeetings > 100) {
      systemHealth = 'critical';
    }

    const stats = {
      totalUsers,
      activeUsers: activeUsersToday,
      totalMeetings,
      activeMeetings,
      totalMessages,
      systemHealth,
      dailyActiveUsers: activeUsersToday,
      averageMeetingDuration,
    };

    console.log('✅ Admin stats retrieved successfully');

    return successResponse({
      ...stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Failed to get admin stats:', error);
    return errorResponse('Failed to retrieve admin statistics', 'ADMIN_STATS_ERROR', 500);
  }
}

// =====================================
// ROUTE HANDLERS
// =====================================

export const GET = withAuth(getAdminStats, {
  rateLimit: { windowMs: 60000, maxRequests: 30 },
}); 