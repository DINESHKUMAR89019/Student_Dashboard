import { NextResponse } from 'next/server';

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorResponse(error, defaultMessage = 'An error occurred') {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  let statusCode = 500;
  let message = defaultMessage;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(e => e.message).join(', ');
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate entry found';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  return NextResponse.json(
    { success: false, error: message },
    { status: statusCode }
  );
}

export function successResponse(data, statusCode = 200) {
  return NextResponse.json(
    { success: true, data },
    { status: statusCode }
  );
}
