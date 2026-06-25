const cleanBaseUrl = (value?: string) => (value || "").replace(/\/+$/, "");

export const API_BASE_URL =
  cleanBaseUrl(import.meta.env.VITE_API_BASE_URL) ||
  cleanBaseUrl(import.meta.env.VITE_API_URL) ||
  (import.meta.env.DEV ? "http://localhost:3001" : "");

export const apiUrl = (path: string) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${API_BASE_URL}${cleanPath}`;
};
