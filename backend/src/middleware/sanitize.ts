// ── Input Sanitization Middleware ──
// Strips HTML tags and dangerous characters from user-provided strings
// to prevent stored XSS. Applied to POST/PUT routes that accept user input.

import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

// Fields to sanitize — covers common user input fields across the app.
// `formData` is a JSON string containing nested user inputs (names, addresses, etc.)
const STRING_FIELDS = ['name', 'email', 'mobile', 'message', 'notes', 'address', 'formData'];

// ── Deep-sanitize a value: recurse into objects/arrays, strip HTML from strings ──
function sanitizeValue(value: any): any {
  if (typeof value === 'string') {
    return xss(value, {
      whiteList: {},          // no HTML tags allowed
      stripIgnoreTag: true,   // strip all non-whitelisted tags
      stripIgnoreTagBody: ['script', 'style'], // strip script/style entirely
    });
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === 'object') {
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      clean[key] = sanitizeValue(val);
    }
    return clean;
  }
  return value;
}

// ── Middleware: sanitize req.body string fields + deep-clean formData JSON ──
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    for (const field of STRING_FIELDS) {
      if (req.body[field] !== undefined) {
        req.body[field] = sanitizeValue(req.body[field]);
      }
    }
    // Deep-sanitize formData (it's a JSON string containing nested user inputs)
    if (req.body.formData && typeof req.body.formData === 'string') {
      try {
        const parsed = JSON.parse(req.body.formData);
        req.body.formData = JSON.stringify(sanitizeValue(parsed));
      } catch {
        // formData is a plain string, sanitize it directly
        req.body.formData = sanitizeValue(req.body.formData);
      }
    }
  }
  next();
}
