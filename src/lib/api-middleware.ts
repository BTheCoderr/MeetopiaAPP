import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =====================================
// TYPES
// =====================================

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    username: string;
    role?: string;
  };
}

export interface ApiHandlerOptions {
  requireAuth?: boolean;
  requireRoles?: string[];
  validateBody?: z.ZodSchema;
  validateQuery?: z.ZodSchema;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
}

// =====================================
// ERROR CLASSES
// =====================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, public errors?: any) {
    super(400, message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(429, message, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

// =====================================
// RATE LIMITING
// =====================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, windowMs: number, maxRequests: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// =====================================
// AUTHENTICATION HELPERS
// =====================================

export async function authenticateRequest(request: NextRequest): Promise<any> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthenticationError('Invalid authorization header');
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Fetch user from database to ensure they still exist and get latest data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isFlagged: true,
      },
    });

    if (!user || user.isFlagged) {
      throw new AuthenticationError('User not found or account suspended');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthenticationError('Invalid token');
    }
    throw error;
  }
}

// =====================================
// VALIDATION HELPERS
// =====================================

export function validateRequestBody<T>(schema: z.ZodSchema<T>, body: any): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Validation failed', {
        errors: error.flatten().fieldErrors,
        issues: error.issues,
      });
    }
    throw error;
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>, query: any): T {
  try {
    // Convert URLSearchParams to plain object
    const queryObject: any = {};
    for (const [key, value] of Object.entries(query)) {
      queryObject[key] = value;
    }
    return schema.parse(queryObject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Query validation failed', {
        errors: error.flatten().fieldErrors,
        issues: error.issues,
      });
    }
    throw error;
  }
}

// =====================================
// MAIN API WRAPPER
// =====================================

export function withApiHandler(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  options: ApiHandlerOptions = {}
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      // Rate limiting
      if (options.rateLimit) {
        const identifier = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const allowed = checkRateLimit(
          identifier,
          options.rateLimit.windowMs,
          options.rateLimit.maxRequests
        );
        
        if (!allowed) {
          throw new RateLimitError();
        }
      }

      // Authentication
      if (options.requireAuth) {
        const user = await authenticateRequest(request);
        (request as AuthenticatedRequest).user = user;
      }

      // Body validation
      if (options.validateBody && request.method !== 'GET') {
        let body: any;
        try {
          body = await request.json();
        } catch {
          throw new ValidationError('Invalid JSON in request body');
        }
        
        const validatedBody = validateRequestBody(options.validateBody, body);
        // Attach validated body to request for easy access
        (request as any).validatedBody = validatedBody;
      }

      // Query validation
      if (options.validateQuery) {
        const url = new URL(request.url);
        const query = Object.fromEntries(url.searchParams.entries());
        const validatedQuery = validateQuery(options.validateQuery, query);
        (request as any).validatedQuery = validatedQuery;
      }

      // Call the actual handler
      return await handler(request as AuthenticatedRequest, context);

    } catch (error) {
      console.error('API Error:', error);

      // Handle known API errors
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: {
              message: error.message,
              code: error.code,
              ...(error instanceof ValidationError && { details: error.errors }),
            },
          },
          { status: error.statusCode }
        );
      }

      // Handle Prisma errors
      if (error instanceof Error && error.message.includes('Prisma')) {
        return NextResponse.json(
          {
            error: {
              message: 'Database error',
              code: 'DATABASE_ERROR',
            },
          },
          { status: 500 }
        );
      }

      // Handle unexpected errors
      return NextResponse.json(
        {
          error: {
            message: 'Internal server error',
            code: 'INTERNAL_ERROR',
          },
        },
        { status: 500 }
      );
    }
  };
}

// =====================================
// SPECIALIZED WRAPPERS
// =====================================

export function withAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  additionalOptions: Omit<ApiHandlerOptions, 'requireAuth'> = {}
) {
  return withApiHandler(handler, { ...additionalOptions, requireAuth: true });
}

export function withValidation<T, Q = any>(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  bodySchema?: z.ZodSchema<T>,
  querySchema?: z.ZodSchema<Q>,
  additionalOptions: ApiHandlerOptions = {}
) {
  return withApiHandler(handler, {
    ...additionalOptions,
    validateBody: bodySchema,
    validateQuery: querySchema,
  });
}

export function withRateLimit(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  windowMs: number = 60000, // 1 minute
  maxRequests: number = 60, // 60 requests per minute
  additionalOptions: ApiHandlerOptions = {}
) {
  return withApiHandler(handler, {
    ...additionalOptions,
    rateLimit: { windowMs, maxRequests },
  });
}

// =====================================
// DATABASE CONNECTION WITH RETRY
// =====================================

export async function connectWithRetry(retries: number = 5, delay: number = 2000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      console.log('✅ Prisma connected successfully');
      return;
    } catch (error) {
      console.warn(`⚠️ Prisma connect failed (attempt ${i + 1}/${retries}):`, error);
      
      if (i === retries - 1) {
        throw new Error(`Could not establish database connection after ${retries} attempts`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// =====================================
// RESPONSE HELPERS
// =====================================

export function successResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json({
    success: true,
    message,
    data,
  }, { status });
}

export function errorResponse(message: string, code?: string, status: number = 400) {
  return NextResponse.json({
    success: false,
    error: {
      message,
      code,
    },
  }, { status });
}

// =====================================
// CLEANUP
// =====================================

export async function cleanup() {
  await prisma.$disconnect();
} 