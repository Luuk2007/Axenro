
// Input sanitization and security utilities
export class SecurityUtils {
  // HTML entity encoding to prevent XSS
  static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Sanitize text input by removing potentially dangerous characters
  static sanitizeText(input: string, maxLength: number = 500): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove control characters and normalize whitespace
    let sanitized = input
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Truncate to max length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    return sanitized;
  }

  // Sanitize search queries to prevent injection attempts
  static sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') return '';
    
    // Remove potentially dangerous characters for search
    return query
      .replace(/[<>'"&\\/\x00-\x1F\x7F]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100); // Limit search query length
  }

  // Validate and sanitize numeric inputs
  static sanitizeNumber(input: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number {
    const num = parseFloat(input);
    if (isNaN(num) || !isFinite(num)) return 0;
    return Math.max(min, Math.min(max, num));
  }

  // Validate email format (basic)
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Rate limiting utility (simple in-memory implementation)
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const record = this.rateLimitStore.get(key);
    
    if (!record || now > record.resetTime) {
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (record.count >= maxRequests) {
      return false;
    }
    
    record.count++;
    return true;
  }

  // Log security events (in production, this should go to a proper logging service)
  static logSecurityEvent(event: string, details: any = {}) {
    console.warn('[SECURITY EVENT]', event, {
      timestamp: new Date().toISOString(),
      ...details
    });
  }
}
