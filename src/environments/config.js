export const config = {
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081',
  VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
}; 