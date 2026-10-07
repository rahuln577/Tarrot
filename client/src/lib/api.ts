const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

/**
 * Constructs a fully qualified or relative API URL based on VITE_API_BASE_URL.
 * If VITE_API_BASE_URL is not set (typical for dev server with Vite proxy),
 * returns the relative path.
 */
export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${BASE_URL}${cleanEndpoint}`
}
