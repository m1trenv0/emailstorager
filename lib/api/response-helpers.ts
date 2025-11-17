import { NextResponse } from 'next/server';

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: string, status = 500, details?: unknown) {
  const response: { error: string; details?: unknown } = { error };
  if (details) response.details = details;
  return NextResponse.json(response, { status });
}

export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}

export function validationErrorResponse(details: unknown) {
  return errorResponse('Validation failed', 400, details);
}
