import { NextResponse } from 'next/server';
import { withAuth, successResponse, errorResponse } from '@/lib/api-middleware';
import { calendarService } from '@/lib/calendar-service';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

// =====================================
// GET /api/calendar/auth - Get Google OAuth URL
// =====================================

async function getCalendarAuthUrl(request: AuthenticatedRequest) {
  try {
    const authUrl = calendarService.getAuthUrl(request.user!.id);

    return successResponse({
      authUrl,
      message: 'Google Calendar authentication URL generated',
    });
  } catch (error) {
    console.error('❌ Failed to generate auth URL:', error);
    return errorResponse('Failed to generate authentication URL', 'AUTH_URL_ERROR', 500);
  }
}

// =====================================
// ROUTE HANDLERS
// =====================================

export const GET = withAuth(getCalendarAuthUrl, {
  rateLimit: { windowMs: 60000, maxRequests: 20 },
}); 