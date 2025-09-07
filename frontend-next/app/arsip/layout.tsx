import type { Metadata } from 'next'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const tabParam = Array.isArray(searchParams?.tab)
    ? searchParams?.tab?.[0]
    : (searchParams?.tab as string | undefined)

  const tab = (tabParam ?? 'masuk').toLowerCase()

  const titles: Record<string, string> = {
    masuk: 'Arsip Surat Masuk',
    keluar: 'Arsip Surat Keluar',
    upload: 'Upload Arsip',
  }

  const descriptions: Record<string, string> = {
    masuk: 'Daftar surat masuk yang diarsipkan.',
    keluar: 'Daftar surat keluar yang diarsipkan.',
    upload: 'Unggah berkas arsip surat.',
  }

  const title = titles[tab] ?? 'Arsip'
  const description = descriptions[tab] ?? 'Halaman arsip gabungan untuk Surat Masuk dan Surat Keluar dengan fitur upload.'

  return {
    title,
    description,
  }
}

export default function ArsipLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
