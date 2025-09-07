import type { Metadata } from 'next'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const rawQ = Array.isArray(searchParams?.q)
    ? searchParams?.q?.[0]
    : (searchParams?.q as string | undefined)
  const rawTab = Array.isArray(searchParams?.tab)
    ? searchParams?.tab?.[0]
    : (searchParams?.tab as string | undefined)

  const q = (rawQ ?? '').trim()
  const tab = (rawTab ?? 'surat-masuk').trim()
  const base = tab === 'surat-tembusan' ? 'Surat Tembusan' : 'Surat Masuk'

  const title = q ? `${base} — Cari: "${q}"` : base
  const description = q
    ? `${base}. Pencarian: ${q}`
    : (tab === 'surat-tembusan' ? 'Kelola dan lihat daftar Surat Tembusan.' : 'Kelola dan lihat daftar Surat Masuk.')

  return {
    title,
    description,
  }
}

export default function SuratMasukLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
