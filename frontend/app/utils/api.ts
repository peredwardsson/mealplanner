// Get the base URL for API requests
export function apiUrl(path: string): string {
  // Use environment variable if set, otherwise default to local development URL
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  // Remove any trailing slashes from baseUrl and leading slashes from path
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}
