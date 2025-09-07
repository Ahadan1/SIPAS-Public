import { apiFetch } from "./api";

export type ApiUser = {
  id?: number;
  name?: string; // generic name field if present
  nama?: string; // Laravel field used in your AuthController response
  email?: string;
  jabatan?: string | { nama_jabatan?: string } | null;
  [key: string]: any;
};

export async function fetchMe(): Promise<ApiUser> {
  // /api/user returns the authenticated user
  const me = await apiFetch<ApiUser>("/api/user", { auth: true });
  return me || {};
}
