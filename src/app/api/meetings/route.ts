import { NextResponse } from 'next/server';
import { withAuth, withValidation, successResponse, NotFoundError } from '@/lib/api-middleware';
import { createMeetingSchema, meetingQuerySchema } from '@/lib/validations';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const prisma = new PrismaClient();

// =====================================
// GET /api/meetings - List meetings for authenticated user
// =====================================

async function getMeetings(request: AuthenticatedRequest) {
  const url = new URL(request.url);
  const query = Object.fromEntries(url.searchParams.entries());
  
  // Parse and validate query parameters
  const validatedQuery = (request as any).validatedQuery || {};
  const { page = 1, limit = 10, status, startDate, endDate, hostId } = validatedQuery;

  // Build where clause
  const where: any = {
    OR: [
      { hostId: request.user!.id },
      {
        participants: {
          some: {
            userId: request.user!.id,
          },
        },
      },
    ],
  };

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.startTime = {};
    if (startDate) where.startTime.gte = new Date(startDate);
    if (endDate) where.startTime.lte = new Date(endDate);
  }

  if (hostId) {
    where.hostId = hostId;
  }

  // Execute query with pagination
  const [meetings, totalCount] = await Promise.all([
    prisma.meeting.findMany({
      where,
      include: {
        host: {
          select: { id: true, username: true, displayName: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true },
            },
          },
        },
        _count: {
          select: {
            participants: true,
            chatMessages: true,
            recordings: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.meeting.count({ where }),
  ]);

  return successResponse({
    meetings,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
    },
  });
}

// =====================================
// POST /api/meetings - Create new meeting
// =====================================

async function createMeeting(request: AuthenticatedRequest) {
  const data = (request as any).validatedBody;

  // Create meeting with host as first participant
  const meeting = await prisma.meeting.create({
    data: {
      title: data.title,
      description: data.description,
      hostId: request.user!.id,
      startTime: new Date(data.startTime),
      duration: data.duration,
      isPublic: data.isPublic || false,
      maxParticipants: data.maxParticipants || 10,
      allowChat: data.allowChat !== false,
      allowScreenShare: data.allowScreenShare !== false,
      requireApproval: data.requireApproval || false,
      waitingRoom: data.waitingRoom !== false,
      participants: {
        create: {
          userId: request.user!.id,
          role: 'HOST',
          status: 'JOINED',
          canSpeak: true,
          canVideo: true,
          canShare: true,
        },
      },
    },
    include: {
      host: {
        select: { id: true, username: true, displayName: true },
      },
      participants: {
        include: {
          user: {
            select: { id: true, username: true, displayName: true },
          },
        },
      },
    },
  });

  // TODO: Send calendar invites if invitedEmails provided
  if (data.invitedEmails && data.invitedEmails.length > 0) {
    // This will be implemented in the calendar integration phase
    console.log('TODO: Send calendar invites to:', data.invitedEmails);
  }

  return successResponse(meeting, 'Meeting created successfully', 201);
}

// =====================================
// ROUTE HANDLERS
// =====================================

export const GET = withAuth(
  withValidation(getMeetings, undefined, meetingQuerySchema),
  {
    rateLimit: { windowMs: 60000, maxRequests: 100 }, // 100 requests per minute
  }
);

export const POST = withAuth(
  withValidation(createMeeting, createMeetingSchema),
  {
    rateLimit: { windowMs: 60000, maxRequests: 10 }, // 10 meetings per minute
  }
); 