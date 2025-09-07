'use client'

import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Calendar as CalendarIcon, Search, Loader2, Upload, FileText, CloudUpload, CheckCircle, AlertCircle, X, File, FileImage, FileSpreadsheet, FileType } from 'lucide-react'

// layout
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

// UI
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { apiFetch } from '@/lib/api'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Upload form deps
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from '@/components/ui/file-uploader'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

// Shared constants
const unitKerjaOptions = ['BAS', 'SIL', 'SKSG']
const tujuanOptions = ['Direktur', 'Wakil Direktur', 'Kepala BAS', 'Koord. PPF', 'Koord. PPK']

// Keep document title/meta in sync with current tab for instant UX feedback
function useDynamicArsipTitle() {
  const searchParams = useSearchParams()
  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() || '')
    const tab = (sp.get('tab') || 'masuk').toLowerCase()

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

    // Update document title
    document.title = title
    // Update meta description if present
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', description)
  }, [searchParams])
}

// Types for archives
type ArsipMasuk = {
  id: number
  perihal: string
  dari: string
  ke: string
  no_surat: string
  tgl_surat: string
  tgl_diterima?: string | null
  no_agenda?: string | null
  derajat?: string | null
  unit_kerja?: string | null
  file_upload?: string | null
}

type ArsipKeluar = {
  id: number
  perihal: string
  tujuan: string
  kepada: string
  no_surat: string
  tgl_surat: string
  tgl_diterima?: string | null
  no_agenda?: string | null
  derajat?: string | null
  unit_kerja?: string | null
  file_upload?: string | null
}

function ArsipBreadcrumb(): React.ReactNode {
  return (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbPage>Arsip</BreadcrumbPage>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/arsip">Ringkasan</BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  )
}

function ArsipMasukTab() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [rows, setRows] = useState<ArsipMasuk[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [enableNoSurat, setEnableNoSurat] = useState(false)
  const [noSurat, setNoSurat] = useState('')
  const [enablePerihal, setEnablePerihal] = useState(false)
  const [perihal, setPerihal] = useState('')
  const [enableTujuan, setEnableTujuan] = useState(false)
  const [tujuan, setTujuan] = useState('') // mapped to backend param `pengirim`
  const [enableTglSurat, setEnableTglSurat] = useState(false)
  const [enableUnitKerja, setEnableUnitKerja] = useState(false)
  const [unitKerja, setUnitKerja] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() || '')
    const p = Number(sp.get('page') || '1')
    const pp = Number(sp.get('per_page') || '10')
    if (!Number.isNaN(p)) setCurrentPage(Math.max(1, p))
    if (!Number.isNaN(pp)) setItemsPerPage(Math.max(1, pp))

    const vNo = sp.get('no_surat') || ''
    if (vNo) { setEnableNoSurat(true); setNoSurat(vNo) }
    const vPer = sp.get('perihal') || ''
    if (vPer) { setEnablePerihal(true); setPerihal(vPer) }
    const vPengirim = sp.get('pengirim') || ''
    if (vPengirim) { setEnableTujuan(true); setTujuan(vPengirim) }
    const vTgl = sp.get('tgl_surat') || ''
    if (vTgl) { setEnableTglSurat(true); try { setDate(new Date(vTgl)) } catch { /* noop */ } }
    const vUk = sp.get('unit_kerja') || ''
    if (vUk) { setEnableUnitKerja(true); setUnitKerja(vUk) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pushUrlState = (page = currentPage, perPage = itemsPerPage) => {
    const sp = new URLSearchParams()
    sp.set('tab', 'masuk')
    sp.set('page', String(page))
    sp.set('per_page', String(perPage))
    if (enableNoSurat && noSurat) sp.set('no_surat', noSurat)
    if (enablePerihal && perihal) sp.set('perihal', perihal)
    if (enableTujuan && tujuan) sp.set('pengirim', tujuan)
    if (enableTglSurat && date) sp.set('tgl_surat', format(date, 'yyyy-MM-dd'))
    if (enableUnitKerja && unitKerja) sp.set('unit_kerja', unitKerja)
    router.replace(`${pathname}?${sp.toString()}`)
  }

  const loadRows = async (page = 1, perPage = itemsPerPage) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('type', 'masuk')
      params.set('page', String(page))
      params.set('per_page', String(perPage))
      if (enableNoSurat && noSurat) params.set('no_surat', noSurat)
      if (enablePerihal && perihal) params.set('perihal', perihal)
      if (enableTujuan && tujuan) params.set('pengirim', tujuan)
      if (enableTglSurat && date) params.set('tgl_surat', format(date, 'yyyy-MM-dd'))
      if (enableUnitKerja && unitKerja) params.set('unit_kerja', unitKerja)
      const res = await apiFetch<any>(`/api/v1/arsip?${params.toString()}`, { auth: true })
      const data = Array.isArray(res) ? res : res.data
      setRows(data)
      if (!Array.isArray(res)) {
        setTotalItems(res.total ?? data.length)
        setLastPage(res.last_page ?? 1)
        setCurrentPage(res.current_page ?? page)
        setItemsPerPage(res.per_page ?? perPage)
      } else {
        setTotalItems(data.length)
        setLastPage(1)
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat data arsip surat masuk')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRows(currentPage, itemsPerPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage])

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows
    const q = searchQuery.toLowerCase()
    return rows.filter(r =>
      [r.perihal, r.dari, r.ke, r.no_surat, r.tgl_surat, r.tgl_diterima, r.no_agenda, r.derajat, r.unit_kerja]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    )
  }, [rows, searchQuery])

  const startIndex = rows.length ? ((currentPage - 1) * itemsPerPage) : 0
  const totalPages = lastPage

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pencarian Surat Masuk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="no-surat-masuk" checked={enableNoSurat} onCheckedChange={(v) => setEnableNoSurat(Boolean(v))} />
                <label htmlFor="no-surat-masuk" className="min-w-[100px]">No Surat</label>
                <Input placeholder="Cari No Surat..." value={noSurat} onChange={(e) => setNoSurat(e.target.value)} disabled={!enableNoSurat} onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); pushUrlState(1, itemsPerPage); loadRows(1, itemsPerPage) } }} />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="perihal-masuk" checked={enablePerihal} onCheckedChange={(v) => setEnablePerihal(Boolean(v))} />
                <label htmlFor="perihal-masuk" className="min-w-[100px]">Perihal</label>
                <Input placeholder="Cari Perihal..." value={perihal} onChange={(e) => setPerihal(e.target.value)} disabled={!enablePerihal} onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); pushUrlState(1, itemsPerPage); loadRows(1, itemsPerPage) } }} />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="tujuan-masuk" checked={enableTujuan} onCheckedChange={(v) => setEnableTujuan(Boolean(v))} />
                <label htmlFor="tujuan-masuk" className="min-w-[100px]">Pengirim</label>
                <Select value={tujuan} onValueChange={(v) => { setTujuan(v) }} disabled={!enableTujuan}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="~ ~ PILIH ~ ~" /></SelectTrigger>
                  <SelectContent>
                    {tujuanOptions.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="tgl-surat-masuk" checked={enableTglSurat} onCheckedChange={(v) => setEnableTglSurat(Boolean(v))} />
                <label htmlFor="tgl-surat-masuk" className="min-w-[100px]">Tgl Surat</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-[240px] justify-start text-left font-normal', !date && 'text-muted-foreground', !enableTglSurat && 'opacity-50')} disabled={!enableTglSurat}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP', { locale: id }) : <span>Pilih Tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} locale={id} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="unit-kerja-masuk" checked={enableUnitKerja} onCheckedChange={(v) => setEnableUnitKerja(Boolean(v))} />
                <label htmlFor="unit-kerja-masuk" className="min-w-[100px]">Unit Kerja</label>
                <Select value={unitKerja} onValueChange={(v) => { setUnitKerja(v) }} disabled={!enableUnitKerja}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="~ ~ PILIH ~ ~" /></SelectTrigger>
                  <SelectContent>
                    {unitKerjaOptions.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-start space-x-2 mt-4">
                <Button onClick={() => { setCurrentPage(1); pushUrlState(1, itemsPerPage); loadRows(1, itemsPerPage) }} disabled={loading}>
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat</>) : 'Cari'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setEnableNoSurat(false); setNoSurat('')
                  setEnablePerihal(false); setPerihal('')
                  setEnableTujuan(false); setTujuan('')
                  setEnableTglSurat(false); setDate(undefined)
                  setEnableUnitKerja(false); setUnitKerja('')
                  setCurrentPage(1); pushUrlState(1, itemsPerPage); loadRows(1, itemsPerPage)
                }}>Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside text-sm text-muted-foreground">
              <li>Gunakan Form disamping untuk melakukan proses pencarian surat masuk.</li>
              <li>Centang filter yang diperlukan lalu isi kata kunci.</li>
              <li>Klik tombol Cari untuk memuat hasil.</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Data Arsip Surat Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Data Per Halaman:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => { const v = Number(value); setItemsPerPage(v); setCurrentPage(1); pushUrlState(1, v); loadRows(1, v); }}>
                <SelectTrigger className="w-[80px]"><SelectValue placeholder="10" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Input placeholder="Pencarian..." className="w-[200px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Button variant="outline" onClick={() => setCurrentPage(1)} className="px-4">
                <Search className="mr-2 h-4 w-4" /> Cari
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[50px]">No</TableHead>
                  <TableHead className="min-w-[200px] max-w-[300px]">Perihal</TableHead>
                  <TableHead className="min-w-[150px]">Dari</TableHead>
                  <TableHead className="min-w-[150px]">Ke</TableHead>
                  <TableHead className="min-w-[200px]">No Surat</TableHead>
                  <TableHead className="min-w-[120px]">Tgl Surat</TableHead>
                  <TableHead className="min-w-[120px]">Tgl Diterima</TableHead>
                  <TableHead className="min-w-[100px]">No Agenda</TableHead>
                  <TableHead className="min-w-[100px]">Derajat</TableHead>
                  <TableHead className="min-w-[100px]">Unit Kerja</TableHead>
                  <TableHead className="min-w-[80px]">File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-m-${i}`}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredRows.length > 0 ? (
                  filteredRows.map((arsip, index) => (
                    <TableRow key={index}>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{arsip.perihal}</TableCell>
                      <TableCell>{arsip.dari}</TableCell>
                      <TableCell>{arsip.ke}</TableCell>
                      <TableCell>{arsip.no_surat}</TableCell>
                      <TableCell>{arsip.tgl_surat}</TableCell>
                      <TableCell>{arsip.tgl_diterima ?? '-'}</TableCell>
                      <TableCell>{arsip.no_agenda ?? '-'}</TableCell>
                      <TableCell>{arsip.derajat ?? '-'}</TableCell>
                      <TableCell>{arsip.unit_kerja ?? '-'}</TableCell>
                      <TableCell>
                        {arsip.file_upload ? (
                          <Button variant="link" size="sm" onClick={() => window.open(arsip.file_upload!, '_blank')}>Download</Button>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">Tidak ada data yang cocok dengan pencarian Anda.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Menampilkan {rows.length ? startIndex + 1 : 0} sampai {rows.length ? Math.min(startIndex + filteredRows.length, totalItems) : 0} dari {totalItems} data
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }} className={cn({ 'pointer-events-none opacity-50': currentPage === 1 })} />
                </PaginationItem>
                {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }} className={cn({ 'pointer-events-none opacity-50': currentPage === totalPages })} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ArsipKeluarTab() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [rows, setRows] = useState<ArsipKeluar[]>([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [enableNoSurat, setEnableNoSurat] = useState(false)
  const [noSurat, setNoSurat] = useState('')
  const [enablePerihal, setEnablePerihal] = useState(false)
  const [perihal, setPerihal] = useState('')
  const [enableTujuan, setEnableTujuan] = useState(false)
  const [tujuan, setTujuan] = useState('')
  const [enableTglSurat, setEnableTglSurat] = useState(false)
  const [enableUnitKerja, setEnableUnitKerja] = useState(false)
  const [unitKerja, setUnitKerja] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const sp = new URLSearchParams(searchParams?.toString() || '')
    const p = Number(sp.get('page') || '1')
    const pp = Number(sp.get('per_page') || '10')
    if (!Number.isNaN(p)) setCurrentPage(Math.max(1, p))
    if (!Number.isNaN(pp)) setItemsPerPage(Math.max(1, pp))

    const vNo = sp.get('no_surat') || ''
    if (vNo) { setEnableNoSurat(true); setNoSurat(vNo) }
    const vPer = sp.get('perihal') || ''
    if (vPer) { setEnablePerihal(true); setPerihal(vPer) }
    const vTujuan = sp.get('tujuan') || ''
    if (vTujuan) { setEnableTujuan(true); setTujuan(vTujuan) }
    const vTgl = sp.get('tgl_surat') || ''
    if (vTgl) { setEnableTglSurat(true); try { setDate(new Date(vTgl)) } catch { /* noop */ } }
    const vUk = sp.get('unit_kerja') || ''
    if (vUk) { setEnableUnitKerja(true); setUnitKerja(vUk) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pushUrlState = (page = currentPage, perPage = itemsPerPage) => {
    const sp = new URLSearchParams()
    sp.set('tab', 'keluar')
    sp.set('page', String(page))
    sp.set('per_page', String(perPage))
    if (enableNoSurat && noSurat) sp.set('no_surat', noSurat)
    if (enablePerihal && perihal) sp.set('perihal', perihal)
    if (enableTujuan && tujuan) sp.set('tujuan', tujuan)
    if (enableTglSurat && date) sp.set('tgl_surat', format(date, 'yyyy-MM-dd'))
    if (enableUnitKerja && unitKerja) sp.set('unit_kerja', unitKerja)
    router.replace(`${pathname}?${sp.toString()}`)
  }

  const loadRows = async (page = 1, perPage = itemsPerPage) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('type', 'keluar')
      params.set('page', String(page))
      params.set('per_page', String(perPage))
      if (enableNoSurat && noSurat) params.set('no_surat', noSurat)
      if (enablePerihal && perihal) params.set('perihal', perihal)
      if (enableTujuan && tujuan) params.set('tujuan', tujuan)
      if (enableTglSurat && date) params.set('tgl_surat', format(date, 'yyyy-MM-dd'))
      if (enableUnitKerja && unitKerja) params.set('unit_kerja', unitKerja)
      const res = await apiFetch<any>(`/api/v1/arsip?${params.toString()}`, { auth: true })
      const data = Array.isArray(res) ? res : res.data
      setRows(data)
      if (!Array.isArray(res)) {
        setTotalItems(res.total ?? data.length)
        setLastPage(res.last_page ?? 1)
        setCurrentPage(res.current_page ?? page)
        setItemsPerPage(res.per_page ?? perPage)
      } else {
        setTotalItems(data.length)
        setLastPage(1)
      }
    } catch (err) {
      console.error(err)
      toast.error('Gagal memuat data arsip surat keluar')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRows(currentPage, itemsPerPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage])

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows
    const q = searchQuery.toLowerCase()
    return rows.filter(r =>
      [r.perihal, r.tujuan, r.kepada, r.no_surat, r.tgl_surat, r.tgl_diterima, r.no_agenda, r.derajat, r.unit_kerja]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    )
  }, [rows, searchQuery])

  const startIndex = rows.length ? ((currentPage - 1) * itemsPerPage) : 0
  const totalPages = lastPage

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pencarian Surat Keluar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="no-surat-keluar" checked={enableNoSurat} onCheckedChange={(v) => setEnableNoSurat(Boolean(v))} />
                <label htmlFor="no-surat-keluar" className="min-w-[100px]">No Surat</label>
                <Input placeholder="Cari No Surat..." value={noSurat} onChange={(e) => setNoSurat(e.target.value)} disabled={!enableNoSurat} onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); pushUrlState(1, itemsPerPage); loadRows(1, itemsPerPage) } }} />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="perihal-keluar" checked={enablePerihal} onCheckedChange={(v) => setEnablePerihal(Boolean(v))} />
                <label htmlFor="perihal-keluar" className="min-w-[100px]">Perihal</label>
                <Input placeholder="Cari Perihal..." value={perihal} onChange={(e) => setPerihal(e.target.value)} disabled={!enablePerihal} onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); pushUrlState(1, itemsPerPage); loadRows(1, itemsPerPage) } }} />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="tujuan-keluar" checked={enableTujuan} onCheckedChange={(v) => setEnableTujuan(Boolean(v))} />
                <label htmlFor="tujuan-keluar" className="min-w-[100px]">Tujuan</label>
                <Select value={tujuan} onValueChange={(v) => { setTujuan(v) }} disabled={!enableTujuan}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="~ ~ PILIH ~ ~" /></SelectTrigger>
                  <SelectContent>
                    {tujuanOptions.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="tgl-surat-keluar" checked={enableTglSurat} onCheckedChange={(v) => setEnableTglSurat(Boolean(v))} />
                <label htmlFor="tgl-surat-keluar" className="min-w-[100px]">Tgl Surat</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-[240px] justify-start text-left font-normal', !date && 'text-muted-foreground', !enableTglSurat && 'opacity-50')} disabled={!enableTglSurat}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP', { locale: id }) : <span>Pilih Tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={date} onSelect={setDate} locale={id} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="unit-kerja-keluar" checked={enableUnitKerja} onCheckedChange={(v) => setEnableUnitKerja(Boolean(v))} />
                <label htmlFor="unit-kerja-keluar" className="min-w-[100px]">Unit Kerja</label>
                <Select value={unitKerja} onValueChange={(v) => { setUnitKerja(v) }} disabled={!enableUnitKerja}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="~ ~ PILIH ~ ~" /></SelectTrigger>
                  <SelectContent>
                    {unitKerjaOptions.map(option => (<SelectItem key={option} value={option}>{option}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-start space-x-2 mt-4">
                <Button onClick={() => { setCurrentPage(1); pushUrlState(1, itemsPerPage); loadRows(1, itemsPerPage) }} disabled={loading}>
                  {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat</>) : 'Cari'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setEnableNoSurat(false); setNoSurat('')
                  setEnablePerihal(false); setPerihal('')
                  setEnableTujuan(false); setTujuan('')
                  setEnableTglSurat(false); setDate(undefined)
                  setEnableUnitKerja(false); setUnitKerja('')
                  setCurrentPage(1); pushUrlState(1, itemsPerPage); loadRows(1, itemsPerPage)
                }}>Reset</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catatan</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside text-sm text-muted-foreground">
              <li>Gunakan Form disamping untuk melakukan proses pencarian surat keluar.</li>
              <li>Centang filter yang diperlukan lalu isi kata kunci.</li>
              <li>Klik tombol Cari untuk memuat hasil.</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Data Arsip Surat Keluar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Data Per Halaman:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => { const v = Number(value); setItemsPerPage(v); setCurrentPage(1); pushUrlState(1, v); loadRows(1, v); }}>
                <SelectTrigger className="w-[80px]"><SelectValue placeholder="10" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Input placeholder="Pencarian..." className="w-[200px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              <Button variant="outline" onClick={() => setCurrentPage(1)} className="px-4">
                <Search className="mr-2 h-4 w-4" /> Cari
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[50px]">No</TableHead>
                  <TableHead className="min-w-[200px] max-w-[300px]">Perihal</TableHead>
                  <TableHead className="min-w-[150px]">Tujuan</TableHead>
                  <TableHead className="min-w-[150px]">Kepada</TableHead>
                  <TableHead className="min-w-[200px]">No Surat</TableHead>
                  <TableHead className="min-w-[120px]">Tgl Surat</TableHead>
                  <TableHead className="min-w-[120px]">Tgl Diterima</TableHead>
                  <TableHead className="min-w-[100px]">No Agenda</TableHead>
                  <TableHead className="min-w-[100px]">Derajat</TableHead>
                  <TableHead className="min-w-[100px]">Unit Kerja</TableHead>
                  <TableHead className="min-w-[80px]">File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skel-k-${i}`}>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredRows.length > 0 ? (
                  filteredRows.map((arsip, index) => (
                    <TableRow key={index}>
                      <TableCell>{startIndex + index + 1}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{arsip.perihal}</TableCell>
                      <TableCell>{arsip.tujuan}</TableCell>
                      <TableCell>{arsip.kepada}</TableCell>
                      <TableCell>{arsip.no_surat}</TableCell>
                      <TableCell>{arsip.tgl_surat}</TableCell>
                      <TableCell>{arsip.tgl_diterima ?? '-'}</TableCell>
                      <TableCell>{arsip.no_agenda ?? '-'}</TableCell>
                      <TableCell>{arsip.derajat ?? '-'}</TableCell>
                      <TableCell>{arsip.unit_kerja ?? '-'}</TableCell>
                      <TableCell>
                        {arsip.file_upload ? (
                          <Button variant="link" size="sm" onClick={() => window.open(arsip.file_upload!, '_blank')}>Download</Button>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center">Tidak ada data yang cocok dengan pencarian Anda.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Menampilkan {rows.length ? startIndex + 1 : 0} sampai {rows.length ? Math.min(startIndex + filteredRows.length, totalItems) : 0} dari {totalItems} data
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} />
                </PaginationItem>
                {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Upload Tab
const documentCategories = [
  { value: 'General', label: 'General', color: 'bg-blue-100 text-blue-800' },
  { value: 'Finance', label: 'Keuangan', color: 'bg-green-100 text-green-800' },
  { value: 'HR', label: 'SDM', color: 'bg-purple-100 text-purple-800' },
  { value: 'Legal', label: 'Hukum', color: 'bg-red-100 text-red-800' },
  { value: 'Marketing', label: 'Pemasaran', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'Operations', label: 'Operasional', color: 'bg-indigo-100 text-indigo-800' },
]

const uploadFormSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, { message: 'Minimal satu berkas harus dipilih' }),
  documentTitle: z.string().min(1, { message: 'Judul dokumen wajib diisi' }),
  category: z.string().min(1, { message: 'Kategori wajib dipilih' }),
  description: z.string().optional(),
  tags: z.string().optional(),
})

// Helper function to get file icon
const getFileIcon = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf': return <File className="h-4 w-4 text-red-500" />
    case 'docx': case 'doc': return <FileText className="h-4 w-4 text-blue-500" />
    case 'xlsx': case 'xls': return <FileSpreadsheet className="h-4 w-4 text-green-500" />
    case 'pptx': case 'ppt': return <FileImage className="h-4 w-4 text-orange-500" />
    default: return <FileType className="h-4 w-4 text-gray-500" />
  }
}

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

type UploadFormValues = z.infer<typeof uploadFormSchema>

function UploadTab() {
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: { files: [], documentTitle: '', category: '', description: '', tags: '' },
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
  }

  const onSubmit = async (data: UploadFormValues) => {
    if (submitting) return;
    try {
      setSubmitting(true)
      setUploadProgress(0)
      
      // Build FormData for multipart upload
      const fd = new FormData()
      // files[] from local state to ensure actual File objects
      if (!files || files.length === 0) {
        toast.error('Pilih minimal satu berkas')
        return
      }
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 20
        })
      }, 200)
      
      files.forEach(f => fd.append('files[]', f))
      if (data.documentTitle) fd.append('documentTitle', data.documentTitle)
      if (data.category) fd.append('category', data.category)
      if (data.description) fd.append('description', data.description)
      if (data.tags) fd.append('tags', data.tags)

      const res = await apiFetch<any>('/api/v1/upload', { method: 'POST', body: fd, auth: true })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      const uploadedCount = Array.isArray(res?.files) ? res.files.length : files.length
      toast.success(`Berhasil mengunggah ${uploadedCount} berkas ke arsip`) 
      
      // Reset form and local files
      form.reset({ files: [], documentTitle: '', category: '', description: '', tags: '' })
      setFiles([])
      setUploadProgress(0)
    } catch (e: any) {
      console.error('Upload failed', e)
      toast.error(e?.message || 'Gagal mengunggah berkas')
      setUploadProgress(0)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <CloudUpload className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Upload Dokumen ke Arsip</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Unggah dokumen penting Anda ke sistem arsip digital dengan mudah dan aman
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* File Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Pilih Berkas</h3>
                    <span className="text-sm text-muted-foreground">*</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="files"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <div className="space-y-4">
                            <FileUploader
                              value={files}
                              onValueChange={setFiles}
                              reSelect
                              dropzoneOptions={{
                                multiple: true,
                                maxSize: 50 * 1024 * 1024,
                                accept: {
                                  'application/pdf': ['.pdf'],
                                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                                  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                                },
                              }}
                              className={cn(
                                "relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 border-2 border-dashed transition-all duration-200",
                                dragActive ? "border-primary bg-primary/20" : "border-primary/30 hover:border-primary/50"
                              )}
                            />
                            
                            {files.length === 0 ? (
                              <div className="flex items-center justify-center flex-col gap-4 py-8">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                  <CloudUpload className="h-10 w-10 text-primary" />
                                </div>
                                <div className="text-center space-y-2">
                                  <p className="text-lg font-semibold text-foreground">
                                    Tarik berkas ke sini atau klik untuk memilih
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Mendukung PDF, DOCX, XLSX, PPTX (maks. 50MB per berkas)
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-foreground">
                                    {files.length} berkas dipilih
                                  </p>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setFiles([])}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Hapus Semua
                                  </Button>
                                </div>
                                
                                <div className="grid gap-3">
                                  {files.map((file, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                                      {getFileIcon(file.name)}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                                      </div>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFile(i)}
                                        className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Document Information */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Informasi Dokumen</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="documentTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-1">
                            Judul Dokumen
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Masukkan judul dokumen" 
                              className="h-11"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium flex items-center gap-1">
                            Kategori
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Pilih kategori dokumen" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {documentCategories.map(cat => (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={cn("w-3 h-3 rounded-full", cat.color.split(' ')[0])} />
                                    {cat.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Deskripsi singkat mengenai isi dokumen (opsional)" 
                            className="min-h-[100px] resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Tags</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Pisahkan dengan koma (contoh: budget, 2024, finance)" 
                            className="h-11"
                            {...field} 
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Tags membantu dalam pencarian dan kategorisasi dokumen
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>

                {/* Upload Progress */}
                {submitting && (
                  <div className="space-y-3 p-4 bg-primary/5 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">Mengunggah dokumen...</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(uploadProgress)}% selesai
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      form.reset()
                      setFiles([])
                    }}
                    disabled={submitting}
                  >
                    Reset Form
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submitting || files.length === 0}
                    className="flex-1 h-11"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Mengunggah...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Kirim untuk Persetujuan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ArsipPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  useDynamicArsipTitle()
  const defaultTab = (searchParams?.get('tab') as 'masuk' | 'keluar' | 'upload') || 'masuk'

  return (
    <SidebarProvider style={{ '--sidebar-width': '19rem' } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader breadcrumbs={ArsipBreadcrumb()} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 py-4 px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-4">Arsip</h1>
            <Tabs
              defaultValue={defaultTab}
              className="w-full"
              onValueChange={(v) => {
                const sp = new URLSearchParams(searchParams?.toString() || '')
                sp.set('tab', v)
                router.replace(`${pathname}?${sp.toString()}`)
              }}
            >
              <TabsList>
                <TabsTrigger value="masuk">Surat Masuk</TabsTrigger>
                <TabsTrigger value="keluar">Surat Keluar</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="masuk">
                <ArsipMasukTab />
              </TabsContent>
              <TabsContent value="keluar">
                <ArsipKeluarTab />
              </TabsContent>
              <TabsContent value="upload">
                <UploadTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
