import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import validator from 'validator';
import { verifyAccessToken, validateCSRFToken, DecodedToken } from './authTokens';

/**
 * Extend Express Request type with authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken & { id?: string };
      csrfToken?: string;
      rateLimitInfo?: {
        limit: number;
        current: number;
        remaining: number;
      };
    }
  }
}

/**
 * Security headers middleware using Helmet
 */
export function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", process.env.API_URL || 'localhost'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    permissionsPolicy: {
      geolocation: [],
      microphone: [],
      camera: [],
      payment: [],
    },
  });
}

/**
 * CORS configuration
 */
export function corsConfig() {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',');

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    maxAge: 3600,
  });
}

/**
 * Request validation and sanitization
 */
export function validateAndSanitize() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query params
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query) as any;
    }

    // Sanitize URL params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params) as any;
    }

    next();
  };
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Validate and sanitize keys
      if (!isValidKey(key)) {
        continue;
      }
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return validator.escape(obj).trim();
  }

  return obj;
}

/**
 * Validate object keys to prevent injection
 */
function isValidKey(key: string): boolean {
  // Allow alphanumeric, underscores, hyphens only
  return /^[a-zA-Z0-9_-]+$/.test(key);
}

/**
 * Rate limiting middleware
 */
export const rateLimiters = {
  // General API rate limiter: 100 requests per 15 minutes
  general: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health';
    },
  }),

  // Strict rate limiter for auth endpoints: 5 requests per 15 minutes
  auth: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
    keyGenerator: (req: Request) => {
      return req.body.email || req.ip || 'unknown';
    },
  }),

  // Moderate rate limiter for file uploads: 10 requests per hour
  upload: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: 'Too many uploads, please try again later.',
  }),

  // Strict for password reset: 3 requests per hour
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: 'Too many password reset attempts, please try again later.',
    skipSuccessfulRequests: true,
  }),
};

/**
 * Authentication middleware
 * Verifies JWT token and extracts user info
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Validate token format
    if (!token || token.length < 10) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format',
      });
    }

    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      req.user.id = decoded.sub;

      next();
    } catch (tokenError: any) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: tokenError.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed',
    });
  }
}

/**
 * Role-based authorization middleware
 */
export function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Required roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * CSRF token validation middleware
 */
export function validateCSRF(req: Request, res: Response, next: NextFunction) {
  // Skip for GET requests (they're typically safe)
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionCSRFToken = (req.session as any)?.csrfToken;

  if (!csrfToken || !sessionCSRFToken) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CSRF token missing',
    });
  }

  try {
    if (!validateCSRFToken(csrfToken, sessionCSRFToken)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'CSRF token invalid',
      });
    }
    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'CSRF validation failed',
    });
  }
}

/**
 * Request logging middleware (security focused)
 */
export function securityLogging(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const originalJson = res.json;

  res.json = function (data: any, ...args: any[]) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;

    // Log only API requests
    if (req.path.startsWith('/api')) {
      const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: statusCode,
        duration: `${duration}ms`,
        userId: req.user?.sub || 'anonymous',
        ip: req.ip,
      };

      // Log errors and suspicious activity
      if (statusCode >= 400) {
        console.error('[SECURITY LOG]', logData);
      } else if (statusCode === 200 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
        console.log('[AUTH LOG]', logData);
      }
    }

    return originalJson.call(this, data, ...args);
  };

  next();
}

/**
 * Error handling middleware
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('[ERROR]', {
    message: error.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Don't expose internal error details to client
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal Server Error';

  // Sanitize error message
  const safeMessage =
    statusCode === 500 ? 'Internal Server Error' : message;

  res.status(statusCode).json({
    error: true,
    message: safeMessage,
    timestamp: new Date().toISOString(),
  });
}

export default {
  securityHeaders,
  corsConfig,
  validateAndSanitize,
  rateLimiters,
  authenticate,
  authorize,
  validateCSRF,
  securityLogging,
  errorHandler,
};
