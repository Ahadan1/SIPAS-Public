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

  const title = q ? `Dashboard — Cari: "${q}"` : 'Dashboard'
  const description = q
    ? `Dashboard. Pencarian: ${q}`
    : 'Ringkasan sistem, aktivitas terbaru, dan tindakan cepat.'

  return {
    title,
    description,
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
