export const getApiBaseUrl = () => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  // Fallback for local XAMPP testing
  return "http://localhost:8000";
};

export type ApiOptions = Omit<RequestInit, 'body' | 'headers'> & {
  auth?: boolean; // attach Authorization header
  parseJson?: boolean; // default true
  headers?: HeadersInit;
  body?: any; // allow plain object bodies which will be JSON-encoded
};

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = false, parseJson = true, headers, ...rest } = options;

  const baseUrl = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const finalHeaders = new Headers(headers || {});
  if (!finalHeaders.has("Accept")) {
    finalHeaders.set("Accept", "application/json");
  }

  if (auth) {
    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("authToken");
      if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const init: RequestInit = { ...rest, headers: finalHeaders, credentials: "include" };

  // Auto-encode JSON body when a plain object is provided
  const body: any = (rest as any).body;
  if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof Blob)) {
    if (!finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }
    (init as any).body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e: any) {
    throw new Error(e?.message || "Network error");
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err?.message || err?.error || message;
    } catch (_) {
      // ignore
    }
    throw new Error(message);
  }

  if (!parseJson) return (undefined as unknown) as T;
  // try parse json
  try {
    return (await res.json()) as T;
  } catch (_e) {
    // no body
    return (undefined as unknown) as T;
  }
}
