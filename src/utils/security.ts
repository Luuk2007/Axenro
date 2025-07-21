
// Security utilities for input validation and sanitization
import { z } from 'zod';

// Input validation schemas
export const barcodeSchema = z.string()
  .min(8, 'Barcode must be at least 8 characters')
  .max(14, 'Barcode must be at most 14 characters')
  .regex(/^[0-9]+$/, 'Barcode must contain only numbers');

export const foodNameSchema = z.string()
  .min(1, 'Food name is required')
  .max(100, 'Food name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\s\-_.,()&]+$/, 'Food name contains invalid characters');

export const userIdSchema = z.string().uuid('Invalid user ID format');

// XSS protection utility
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Security logging utility
export const logSecurityEvent = (
  event: string,
  details: Record<string, any>,
  userId?: string
) => {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  // In production, this would send to a logging service
  console.warn('[SECURITY EVENT]', logData);
};

// Rate limiting utility (client-side basic protection)
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (validAttempts.length >= this.maxAttempts) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { key, attempts: validAttempts.length });
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

// Validate and sanitize barcode input
export const validateBarcode = (barcode: string): string => {
  const result = barcodeSchema.safeParse(barcode);
  if (!result.success) {
    logSecurityEvent('INVALID_BARCODE_INPUT', { barcode, errors: result.error.errors });
    throw new Error('Invalid barcode format');
  }
  return result.data;
};

// Validate food name input
export const validateFoodName = (name: string): string => {
  const result = foodNameSchema.safeParse(name);
  if (!result.success) {
    logSecurityEvent('INVALID_FOOD_NAME', { name, errors: result.error.errors });
    throw new Error('Invalid food name format');
  }
  return sanitizeHtml(result.data);
};
