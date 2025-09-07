import type { Metadata } from 'next'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const rawQ = Array.isArray(searchParams?.q)
    ? searchParams?.q?.[0]
    : (searchParams?.q as string | undefined)

  const q = (rawQ ?? '').trim()
  const base = 'Surat Keluar'

  const title = q ? `${base} — Cari: "${q}"` : base
  const description = q
    ? `${base}. Pencarian: ${q}`
    : 'Daftar surat keluar dengan aksi detail, edit, hapus, dan arsip.'

  return {
    title,
    description,
  }
}

export default function SuratKeluarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
