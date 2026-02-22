// Safe environment variable access
function getEnvVar(key: string): string | undefined {
  // @ts-ignore - Vite environment variables
  return import.meta.env[key];
}

const BASE_URL = getEnvVar('VITE_API_URL') || "";

export function getBaseUrl(): string {
  // For development with Vite proxy, use relative URLs
  // For production, use full API URL
  // @ts-ignore - Vite environment variables
  if (import.meta.env.MODE === 'development') {
    return ""; // Use proxy for development
  }
  return BASE_URL.replace(/\/$/, "");
}

export async function request<T>(
  endpoint: string,
  options: RequestInit & { body?: unknown } = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  const url = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
  
  console.log("Making request to:", url);
  
  const { body, ...rest } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = typeof window !== "undefined" ? localStorage.getItem("medisense_token") : null;
  if (token) {
    (headers as Record<string, string>)["Authorization"] = "Bearer " + token;
  }
  
  console.log("Request details:", { url, method: options.method || "GET", headers: { ...headers, Authorization: token ? "Bearer [REDACTED]" : undefined }, body: body ? "[PRESENT]" : "[NONE]" });
  
  const res = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : options.body,
  });
  
  console.log("Response status:", res.status, "URL:", url);
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    console.error("Request failed:", err);
    throw new Error((err as { message?: string }).message || "Request failed");
  }
  return res.json().catch(() => ({} as T));
}

export function isBackendConfigured(): boolean {
  // Check if we have a valid API URL and MongoDB URI
  const apiUrl = getBaseUrl();
  const mongoUri = getEnvVar('MONGODB_URI');
  
  console.log("isBackendConfigured:", { 
    hasApiUrl: !!apiUrl, 
    hasMongoUri: !!mongoUri,
    apiUrl: apiUrl ? "[SET]" : "[NOT SET]",
    mongoUri: mongoUri ? "[SET]" : "[NOT SET]",
    mode: import.meta.env.MODE,
    baseUrl: apiUrl
  });
  
  // For development, always return true if we have a proxy setup
  // @ts-ignore - Vite environment variables
  if (import.meta.env.MODE === 'development') {
    return true; // Use proxy for development
  }
  
  return Boolean(apiUrl && mongoUri);
}
