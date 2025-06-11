import { NextRequest, NextResponse } from 'next/server';

// Define the authenticated request type
export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

// Simple auth middleware for development
export function withAuth(handler: (req: AuthenticatedRequest, context: any) => Promise<NextResponse>) {
  return async (req: NextRequest, context: any) => {
    // For development, we'll create a mock user
    // In production, this would validate JWT tokens, API keys, etc.
    const authenticatedReq = req as AuthenticatedRequest;
    
    // Mock user for development
    authenticatedReq.user = {
      id: 'dev-user-123',
      email: 'dev@meetopia.com',
      role: 'user'
    };
    
    return handler(authenticatedReq, context);
  };
} 