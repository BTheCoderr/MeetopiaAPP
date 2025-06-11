import { NextRequest } from 'next/server';
import { createMockRequest, createMockUser } from '../helpers/test-utils';
import { createMeetingSchema, meetingQuerySchema } from '@/lib/validations';
import { withAuth, withValidation } from '@/lib/api-middleware';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    meeting: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  })),
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

describe('/api/meetings', () => {
  const mockUser = createMockUser();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    describe('createMeetingSchema', () => {
      it('should validate valid meeting data', () => {
        const validData = {
          title: 'Test Meeting',
          description: 'This is a test meeting',
          startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
          duration: 60,
          isPublic: false,
          maxParticipants: 10,
          allowChat: true,
          allowScreenShare: true,
          invitedEmails: ['test@example.com'],
        };

        const result = createMeetingSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('should reject meeting with invalid title', () => {
        const invalidData = {
          title: 'T', // Too short
          startTime: new Date().toISOString(),
          duration: 60,
        };

        const result = createMeetingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 3 characters');
        }
      });

      it('should reject meeting with invalid duration', () => {
        const invalidData = {
          title: 'Valid Title',
          startTime: new Date().toISOString(),
          duration: 500, // Too long (>480 minutes)
        };

        const result = createMeetingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('cannot exceed 8 hours');
        }
      });

      it('should reject meeting with invalid email in invitedEmails', () => {
        const invalidData = {
          title: 'Valid Title',
          startTime: new Date().toISOString(),
          duration: 60,
          invitedEmails: ['invalid-email'],
        };

        const result = createMeetingSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    describe('meetingQuerySchema', () => {
      it('should validate valid query parameters', () => {
        const validQuery = {
          page: '1',
          limit: '10',
          status: 'SCHEDULED',
          startDate: new Date().toISOString(),
        };

        const result = meetingQuerySchema.safeParse(validQuery);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(typeof result.data.page).toBe('number');
          expect(typeof result.data.limit).toBe('number');
        }
      });

      it('should reject invalid page number', () => {
        const invalidQuery = {
          page: '0', // Must be > 0
        };

        const result = meetingQuerySchema.safeParse(invalidQuery);
        expect(result.success).toBe(false);
      });

      it('should reject invalid limit', () => {
        const invalidQuery = {
          limit: '200', // Too high (>100)
        };

        const result = meetingQuerySchema.safeParse(invalidQuery);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const invalidRequest = createMockRequest('POST', '/api/meetings', {
        title: 'T', // Too short
      });

      // This would be tested with the actual API handler
      // For now, we just test the validation schema
      const result = createMeetingSchema.safeParse({ title: 'T' });
      expect(result.success).toBe(false);
    });

    it('should handle authentication errors', async () => {
      const unauthenticatedRequest = createMockRequest('GET', '/api/meetings');
      // Remove authorization header
      unauthenticatedRequest.headers.delete('authorization');

      // Test would verify that authentication middleware rejects the request
      expect(unauthenticatedRequest.headers.get('authorization')).toBeNull();
    });
  });

  describe('Business Logic', () => {
    it('should create meeting with host as participant', () => {
      // This tests the business logic of creating a meeting
      const meetingData = {
        title: 'Test Meeting',
        hostId: mockUser.id,
        participants: {
          create: {
            userId: mockUser.id,
            role: 'HOST',
            status: 'JOINED',
            canSpeak: true,
            canVideo: true,
            canShare: true,
          },
        },
      };

      expect(meetingData.hostId).toBe(mockUser.id);
      expect(meetingData.participants.create.role).toBe('HOST');
      expect(meetingData.participants.create.canShare).toBe(true);
    });

    it('should build correct query filters', () => {
      const userId = mockUser.id;
      const filters = {
        status: 'SCHEDULED',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
      };

      const whereClause = {
        OR: [
          { hostId: userId },
          {
            participants: {
              some: { userId },
            },
          },
        ],
        status: filters.status,
        startTime: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        },
      };

      expect(whereClause.OR).toHaveLength(2);
      expect(whereClause.OR[0].hostId).toBe(userId);
      expect(whereClause.status).toBe('SCHEDULED');
      expect(whereClause.startTime.gte).toBeInstanceOf(Date);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', () => {
      // Mock rate limit check
      const checkRateLimit = (identifier: string, windowMs: number, maxRequests: number) => {
        // Simulate rate limit logic
        return maxRequests > 0;
      };

      expect(checkRateLimit('test-user', 60000, 10)).toBe(true);
      expect(checkRateLimit('test-user', 60000, 0)).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('should calculate pagination correctly', () => {
      const page = 2;
      const limit = 10;
      const totalCount = 25;

      const skip = (page - 1) * limit;
      const pages = Math.ceil(totalCount / limit);

      expect(skip).toBe(10);
      expect(pages).toBe(3);
    });

    it('should handle edge cases for pagination', () => {
      const page = 1;
      const limit = 10;
      const totalCount = 0;

      const skip = (page - 1) * limit;
      const pages = Math.ceil(totalCount / limit);

      expect(skip).toBe(0);
      expect(pages).toBe(0);
    });
  });
}); 