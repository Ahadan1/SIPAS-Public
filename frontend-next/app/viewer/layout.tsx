import { Metadata } from 'next'

export function generateMetadata({ searchParams }: { searchParams?: { q?: string; tab?: string; name?: string } }): Metadata {
  const q = searchParams?.q?.trim()
  const name = searchParams?.name?.trim()
  const base = 'Viewer Dokumen'
  const suffix = name ? ` · ${name}` : ''
  const title = q ? `${base}${suffix} · Pencarian: ${q}` : `${base}${suffix}`
  const description = q
    ? `${base}. Pencarian: ${q}`
    : 'Pratinjau dokumen dan lampiran.'
  return { title, description }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
