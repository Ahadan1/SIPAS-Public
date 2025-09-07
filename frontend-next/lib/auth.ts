import { apiFetch } from "./api";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token?: string;
  token?: string;
  token_type?: string;
  [key: string]: any;
};

const TOKEN_KEY = "authToken";

export async function login(payload: LoginPayload): Promise<string> {
  const res = await apiFetch<LoginResponse>("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    auth: false,
  });

  const token = (res as any)?.access_token || (res as any)?.token;
  if (!token) {
    throw new Error("Token not found in response");
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  return token;
}

export function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
