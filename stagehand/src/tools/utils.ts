export function sanitizeForFilePath(s: string) {
  return s.replace(/[^a-zA-Z0-9_.-]/g, '_'); // More robust sanitization
} 