import { NextResponse } from 'next/server';

// Standardized API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Success response helper
export function successResponse<T>(
  data: T, 
  message?: string, 
  pagination?: ApiResponse['pagination']
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    pagination
  };
  
  return NextResponse.json(response, { status: 200 });
}

// Error response helper
export function errorResponse(
  message: string, 
  status: number = 500
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: message
  };
  
  return NextResponse.json(response, { status });
}

// Validation error response
export function validationErrorResponse(
  message: string = 'Validation failed'
): NextResponse {
  return errorResponse(message, 400);
}

// Not found response
export function notFoundResponse(
  message: string = 'Resource not found'
): NextResponse {
  return errorResponse(message, 404);
}

// Unauthorized response
export function unauthorizedResponse(
  message: string = 'Unauthorized'
): NextResponse {
  return errorResponse(message, 401);
} 