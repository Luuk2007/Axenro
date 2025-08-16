
import { supabase } from '@/integrations/supabase/client';

// Input validation utilities
export const validateChatInput = (input: string): { isValid: boolean; error?: string } => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Input is required' };
  }
  
  if (input.length > 2000) {
    return { isValid: false, error: 'Input too long (max 2000 characters)' };
  }
  
  // Check for potentially malicious patterns
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, error: 'Invalid input detected' };
    }
  }
  
  return { isValid: true };
};

// Rate limiting for AI functions
const AI_RATE_LIMITS = {
  'ai-chat': { maxRequests: 50, windowMs: 60 * 60 * 1000 }, // 50 per hour
  'ai-meal-planner': { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  'ai-workout-coach': { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour
  'ai-progress-analyzer': { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  'ai-meal-analyzer': { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour
};

export const checkRateLimit = async (
  functionName: keyof typeof AI_RATE_LIMITS,
  userId: string
): Promise<{ allowed: boolean; error?: string }> => {
  try {
    const limit = AI_RATE_LIMITS[functionName];
    const windowStart = new Date(Date.now() - limit.windowMs);
    
    // Get current usage
    const { data: rateLimits, error } = await supabase
      .from('rate_limits')
      .select('request_count')
      .eq('user_id', userId)
      .eq('function_name', functionName)
      .gte('window_start', windowStart.toISOString())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking rate limit:', error);
      return { allowed: true }; // Allow on error to not block users
    }
    
    const currentCount = rateLimits?.request_count || 0;
    
    if (currentCount >= limit.maxRequests) {
      return { 
        allowed: false, 
        error: `Rate limit exceeded. Maximum ${limit.maxRequests} requests per hour.` 
      };
    }
    
    // Update or insert rate limit record
    await supabase
      .from('rate_limits')
      .upsert({
        user_id: userId,
        function_name: functionName,
        request_count: currentCount + 1,
        window_start: new Date().toISOString(),
      }, {
        onConflict: 'user_id,function_name,window_start'
      });
    
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true }; // Allow on error to not block users
  }
};

// Secure localStorage utilities
export const secureStorage = {
  setItem: (key: string, value: any, encrypt = false) => {
    try {
      const stringValue = JSON.stringify(value);
      if (encrypt) {
        // For sensitive data, we'd implement proper encryption here
        // For now, just base64 encode as a basic obfuscation
        const encoded = btoa(stringValue);
        localStorage.setItem(`secure_${key}`, encoded);
      } else {
        localStorage.setItem(key, stringValue);
      }
    } catch (error) {
      console.error('Failed to store data:', error);
    }
  },
  
  getItem: (key: string, encrypted = false) => {
    try {
      const storageKey = encrypted ? `secure_${key}` : key;
      const value = localStorage.getItem(storageKey);
      if (!value) return null;
      
      if (encrypted) {
        const decoded = atob(value);
        return JSON.parse(decoded);
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  },
  
  removeItem: (key: string, encrypted = false) => {
    const storageKey = encrypted ? `secure_${key}` : key;
    localStorage.removeItem(storageKey);
  },
  
  clear: () => {
    // Clear all secure storage items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

// Password strength validation
export const validatePasswordStrength = (password: string): { 
  isStrong: boolean; 
  score: number; 
  feedback: string[] 
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }
  
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain lowercase letters');
  }
  
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain uppercase letters');
  }
  
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain numbers');
  }
  
  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain special characters');
  }
  
  if (password.length >= 12) {
    score += 1;
  }
  
  return {
    isStrong: score >= 4,
    score,
    feedback
  };
};

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};
