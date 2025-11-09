import { validateInput, rateLimit } from '@/lib/middleware';
import { z } from 'zod';
import { NextRequest } from 'next/server';

describe('Middleware Tests', () => {
  describe('validateInput', () => {
    const testSchema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
    });

    it('should validate correct input', () => {
      const validData = {
        email: 'test@example.com',
        name: 'John Doe',
      };

      const result = validateInput(testSchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        name: 'John Doe',
      };

      const result = validateInput(testSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('email');
      }
    });

    it('should reject short name', () => {
      const invalidData = {
        email: 'test@example.com',
        name: 'J',
      };

      const result = validateInput(testSchema, invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        email: 'test@example.com',
      };

      const result = validateInput(testSchema, invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('rateLimit', () => {
    const createMockRequest = (ip: string): NextRequest => {
      const url = 'http://localhost:3000/api/test';
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'x-forwarded-for': ip,
        },
      });
      return request;
    };

    beforeEach(() => {
      // Clear rate limit map before each test
      jest.clearAllMocks();
    });

    it('should allow first request from an IP', () => {
      const request = createMockRequest('192.168.1.1');
      const result = rateLimit(request, 5, 60000);
      expect(result).toBeNull();
    });

    it('should track multiple requests from same IP', () => {
      const ip = '192.168.1.2';
      const maxRequests = 3;

      // Make requests up to the limit
      for (let i = 0; i < maxRequests; i++) {
        const request = createMockRequest(ip);
        const result = rateLimit(request, maxRequests, 60000);
        expect(result).toBeNull();
      }

      // Next request should be rate limited
      const request = createMockRequest(ip);
      const result = rateLimit(request, maxRequests, 60000);
      expect(result).not.toBeNull();
    });

    it('should handle different IPs independently', () => {
      const request1 = createMockRequest('192.168.1.3');
      const request2 = createMockRequest('192.168.1.4');

      const result1 = rateLimit(request1, 5, 60000);
      const result2 = rateLimit(request2, 5, 60000);

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });
});
