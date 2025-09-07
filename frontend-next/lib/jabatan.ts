import { apiFetch } from "./api";

export type Jabatan = {
  id: number;
  nama_jabatan: string;
};

type Paginator<T> = { data: T[] };

export async function listJabatan(): Promise<Jabatan[]> {
  const res = await apiFetch<Jabatan[] | Paginator<Jabatan>>("/api/v1/jabatan", { auth: true });
  if (Array.isArray(res)) return res;
  if (res && typeof res === "object" && Array.isArray((res as any).data)) {
    return (res as Paginator<Jabatan>).data;
  }
  return [];
}
