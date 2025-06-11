import { NextResponse } from 'next/server';
import { withAuth, withValidation, successResponse, NotFoundError } from '@/lib/api-middleware';
import { createMeetingSchema } from '@/lib/validations';
import { dailyService } from '@/lib/daily-service';
import { PrismaClient } from '@prisma/client';
import type { AuthenticatedRequest } from '@/lib/api-middleware';

const prisma = new PrismaClient();

// =====================================
// POST /api/daily/rooms - Create Daily room for meeting
// =====================================

async function createDailyRoom(request: AuthenticatedRequest) {
  const { meetingId, maxParticipants = 10 } = await request.json();

  try {
    // Find the meeting in our database
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        host: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    if (!meeting) {
      throw new NotFoundError('Meeting not found');
    }

    // Check if user is authorized (host or participant)
    if (meeting.hostId !== request.user!.id) {
      const participant = await prisma.meetingParticipant.findFirst({
        where: {
          meetingId,
          userId: request.user!.id,
        },
      });

      if (!participant) {
        throw new NotFoundError('You are not authorized to access this meeting');
      }
    }

    // Create Daily.co room
    const dailyRoom = await dailyService.createRoom({
      name: `meetopia-${meetingId}`,
      privacy: meeting.isPublic ? 'public' : 'private',
      maxParticipants: meeting.maxParticipants || maxParticipants,
      enableScreenshare: meeting.allowScreenShare,
      enableChat: meeting.allowChat,
      enableKnocking: meeting.waitingRoom,
      enableRecording: meeting.isRecorded,
    });

    // Update meeting with Daily room info
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        status: 'ACTIVE',
        // We could add a dailyRoomName field to store this
      },
    });

    console.log('✅ Daily room created for meeting:', meetingId);

    return successResponse({
      meetingId,
      dailyRoom: {
        name: dailyRoom.name,
        url: dailyRoom.url,
        id: dailyRoom.id,
      },
      message: 'Daily room created successfully',
    });

  } catch (error) {
    console.error('❌ Failed to create Daily room:', error);
    throw error;
  }
}

// =====================================
// GET /api/daily/rooms/[roomName] - Get room info
// =====================================

async function getDailyRoom(request: AuthenticatedRequest) {
  const url = new URL(request.url);
  const roomName = url.pathname.split('/').pop();

  if (!roomName) {
    throw new NotFoundError('Room name is required');
  }

  try {
    const dailyRoom = await dailyService.getRoom(roomName);
    
    return successResponse({
      room: dailyRoom,
    });

  } catch (error) {
    console.error('❌ Failed to get Daily room:', error);
    throw error;
  }
}

// =====================================
// DELETE /api/daily/rooms/[roomName] - Delete room
// =====================================

async function deleteDailyRoom(request: AuthenticatedRequest) {
  const url = new URL(request.url);
  const roomName = url.pathname.split('/').pop();

  if (!roomName) {
    throw new NotFoundError('Room name is required');
  }

  try {
    // Find meeting associated with this room
    const meetingId = roomName.replace('meetopia-', '');
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
    });

    if (meeting && meeting.hostId !== request.user!.id) {
      throw new NotFoundError('Only the meeting host can delete the room');
    }

    await dailyService.deleteRoom(roomName);

    // Update meeting status
    if (meeting) {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: {
          status: 'ENDED',
          endTime: new Date(),
        },
      });
    }

    return successResponse({
      message: 'Daily room deleted successfully',
    });

  } catch (error) {
    console.error('❌ Failed to delete Daily room:', error);
    throw error;
  }
}

// =====================================
// ROUTE HANDLERS
// =====================================

export const POST = withAuth(createDailyRoom, {
  rateLimit: { windowMs: 60000, maxRequests: 20 },
});

export const GET = withAuth(getDailyRoom, {
  rateLimit: { windowMs: 60000, maxRequests: 100 },
});

export const DELETE = withAuth(deleteDailyRoom, {
  rateLimit: { windowMs: 60000, maxRequests: 10 },
}); 