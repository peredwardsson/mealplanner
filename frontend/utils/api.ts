// frontend/utils/api.ts

export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export function apiUrl(path: string) {
  // Always ensure path starts with '/'
  return `${BACKEND_URL}${path.startsWith('/') ? path : '/' + path}`;
}
