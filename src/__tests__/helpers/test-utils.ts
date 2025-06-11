import { NextRequest } from 'next/server';

// =====================================
// MOCK USER GENERATOR
// =====================================

export function createMockUser(overrides?: Partial<any>) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    username: 'testuser',
    displayName: 'Test User',
    bio: 'A test user for unit tests',
    interests: ['testing', 'development'],
    isFlagged: false,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
    ...overrides,
  };
}

// =====================================
// MOCK REQUEST GENERATOR
// =====================================

export function createMockRequest(
  method: string = 'GET',
  url: string = '/api/test',
  body?: any,
  headers?: Record<string, string>
): NextRequest {
  const mockRequest = {
    method,
    url: `http://localhost:3000${url}`,
    headers: new Headers({
      'content-type': 'application/json',
      'authorization': 'Bearer mock-jwt-token',
      ...headers,
    }),
    json: jest.fn().mockResolvedValue(body),
    text: jest.fn().mockResolvedValue(JSON.stringify(body)),
    formData: jest.fn(),
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    clone: jest.fn(),
    signal: new AbortController().signal,
  } as unknown as NextRequest;

  return mockRequest;
}

// =====================================
// MOCK MEETING GENERATOR
// =====================================

export function createMockMeeting(overrides?: Partial<any>) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 3600000); // 1 hour from now

  return {
    id: 'meeting-id-123',
    title: 'Test Meeting',
    description: 'A test meeting for unit tests',
    hostId: 'test-user-id',
    startTime: futureDate,
    endTime: null,
    duration: 60,
    status: 'SCHEDULED',
    isRecorded: false,
    isPublic: false,
    maxParticipants: 10,
    allowChat: true,
    allowScreenShare: true,
    requireApproval: false,
    waitingRoom: true,
    createdAt: now,
    updatedAt: now,
    host: createMockUser(),
    participants: [],
    chatMessages: [],
    recordings: [],
    ...overrides,
  };
}

// =====================================
// MOCK PRISMA CLIENT
// =====================================

export function createMockPrismaClient() {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    meeting: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    meetingParticipant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    chatMessage: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    recording: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    report: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    feedback: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  };
}

// =====================================
// TEST ENVIRONMENT SETUP
// =====================================

export function setupTestEnvironment() {
  // Set up environment variables for testing
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  // NODE_ENV should be set by Jest automatically to 'test'
}

// =====================================
// RESPONSE HELPERS
// =====================================

export function createSuccessResponse(data: any, message?: string, status: number = 200) {
  return {
    success: true,
    message,
    data,
    status,
  };
}

export function createErrorResponse(message: string, code?: string, status: number = 400) {
  return {
    success: false,
    error: {
      message,
      code,
    },
    status,
  };
}

// =====================================
// CLEANUP HELPERS
// =====================================

export function cleanupMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
}

// =====================================
// ASYNC TEST HELPERS
// =====================================

export async function waitFor(condition: () => boolean, timeout: number = 1000): Promise<void> {
  const startTime = Date.now();
  
  while (!condition() && (Date.now() - startTime) < timeout) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`);
  }
}

export function createDelayedPromise<T>(value: T, delay: number = 100): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), delay);
  });
}

// =====================================
// VALIDATION HELPERS
// =====================================

export function expectValidationError(result: any, field?: string, message?: string) {
  expect(result.success).toBe(false);
  
  if (field && result.error) {
    const fieldError = result.error.flatten().fieldErrors[field];
    expect(fieldError).toBeDefined();
    
    if (message) {
      expect(fieldError[0]).toContain(message);
    }
  }
}

export function expectSuccessfulValidation(result: any) {
  expect(result.success).toBe(true);
  expect(result.data).toBeDefined();
} 