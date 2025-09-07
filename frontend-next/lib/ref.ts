import { apiFetch } from '@/lib/api';

export type UnitKerjaItem = {
  code: string;
  label: string;
};

export type UnitKerjaResponse = {
  data: UnitKerjaItem[];
};

export async function fetchUnitKerja(): Promise<UnitKerjaItem[]> {
  const res = await apiFetch<UnitKerjaResponse | { data?: UnitKerjaItem[] }>(
    '/api/v1/ref-unit-kerja',
    { auth: true }
  );
  const items = (res as any)?.data ?? res ?? [];
  if (!Array.isArray(items)) return [];
  return items as UnitKerjaItem[];
}
