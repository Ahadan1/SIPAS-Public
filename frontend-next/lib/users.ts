import { apiFetch } from "./api";

export type BackendUser = {
  id: number;
  nama?: string;
  name?: string; // in case different naming
  username?: string;
  email?: string;
  jabatan_id?: number | null;
  jabatan?: { id?: number; nama_jabatan?: string } | null;
  is_active?: boolean;
  [key: string]: any;
};

type Paginator<T> = {
  data: T[];
  meta?: any;
  links?: any;
};

export async function listUsers(params?: { page?: number; search?: string }): Promise<BackendUser[]> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.search) qs.set("search", params.search);
  const path = "/api/v1/users" + (qs.toString() ? `?${qs.toString()}` : "");
  const res = await apiFetch<BackendUser[] | Paginator<BackendUser>>(path, { auth: true });
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && Array.isArray((res as any).data)) {
    return (res as Paginator<BackendUser>).data;
  }
  return [];
}

// New: fetch with paginator for lazy loading/infinite scroll
export type UsersPage = Paginator<BackendUser>;

export async function listUsersPaged(params?: { page?: number; per_page?: number; search?: string }): Promise<UsersPage> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.per_page) qs.set("per_page", String(params.per_page));
  if (params?.search) qs.set("search", params.search);
  const path = "/api/v1/users" + (qs.toString() ? `?${qs.toString()}` : "");
  const res = await apiFetch<BackendUser[] | Paginator<BackendUser>>(path, { auth: true });
  if (Array.isArray(res)) {
    return { data: res };
  }
  if (res && typeof res === "object" && Array.isArray((res as any).data)) {
    return res as Paginator<BackendUser>;
  }
  return { data: [] };
}
