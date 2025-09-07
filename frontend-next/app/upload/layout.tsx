import { Metadata } from 'next'

export function generateMetadata({ searchParams }: { searchParams?: { q?: string; tab?: string } }): Metadata {
  const q = searchParams?.q?.trim()
  const base = 'Upload Berkas'
  const title = q ? `${base} · Pencarian: ${q}` : base
  const description = q
    ? `${base}. Pencarian: ${q}`
    : 'Unggah dan kelola berkas surat/arsip.'
  return { title, description }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
