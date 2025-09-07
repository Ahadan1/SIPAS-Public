import { Metadata } from 'next'

export function generateMetadata({ searchParams }: { searchParams?: { q?: string } }): Metadata {
  const q = searchParams?.q?.trim()
  const base = 'Referensi Jabatan'
  const title = q ? `${base} · Pencarian: ${q}` : base
  const description = q
    ? `${base}. Pencarian: ${q}`
    : 'Master data referensi untuk jabatan dan unit.'
  return { title, description }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
