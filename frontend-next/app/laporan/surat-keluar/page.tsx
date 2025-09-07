'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch, getApiBaseUrl } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Sidebar and Navbar components
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Breadcrumb components
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// shadcn/ui components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
// Lazy load Calendar to reduce initial bundle size
const CalendarLazy = dynamic(() => import('@/components/ui/calendar').then(m => m.Calendar), {
  ssr: false,
  loading: () => <div className="p-2"><Skeleton className="h-[300px] w-full" /></div>,
});
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Types
type SuratKeluarRow = {
  id_surat: number;
  no_surat: string | null;
  perihal: string;
  tujuan: string | null;
  tgl_surat: string;
  tgl_catat: string; // input date
  file: string | null;
  kode_jenis: string;
  user?: { id: number; name: string } | null;
  tujuanUsers?: { id: number; name: string }[];
};

export default function LaporanSuratKeluarPage() {
  const [rows, setRows] = useState<SuratKeluarRow[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbPage>Laporan</BreadcrumbPage>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/laporan/surat-keluar">Surat Keluar</BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

  const formattedHeaderDate = `${startDate ? format(startDate, 'd MMMM yyyy') : '...'} s/d ${endDate ? format(endDate, 'd MMMM yyyy') : '...'}`;

  const loadRows = async (page = currentPage, perPage = itemsPerPage, search = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      if (search) params.set('search', search);
      if (startDate && endDate) {
        params.set('tgl_awal', format(startDate, 'yyyy-MM-dd'));
        params.set('tgl_akhir', format(endDate, 'yyyy-MM-dd'));
      }
      const res = await apiFetch<any>(`/api/v1/surat-keluar?${params.toString()}`, { auth: true });
      const data: SuratKeluarRow[] = res?.data ?? [];
      setRows(data);
      setCurrentPage(res?.current_page ?? page);
      setItemsPerPage(res?.per_page ?? perPage);
      setLastPage(res?.last_page ?? 1);
      setTotal(res?.total ?? data.length);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data');
      toast.error(e.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(1, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh when periode changes or is cleared
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    // If both dates chosen and valid, or both cleared, reload page 1
    if ((startDate && endDate && startDate <= endDate) || (!startDate && !endDate)) {
      loadRows(1, itemsPerPage, searchQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 flex-col py-4 px-4 lg:px-6">
          <h1 className="text-2xl font-bold mb-6">Data Laporan Surat Keluar</h1>
          <div className="flex flex-col md:flex-row justify-start space-y-4 md:space-y-0 md:space-x-2 mb-4">
            <Card className="flex-none w-full md:w-fit">
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
                    <Label htmlFor="periode" className="text-sm whitespace-nowrap">Periode:</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="periode"
                          variant={"outline"}
                          className={cn(
                            "w-full md:w-[150px] justify-start text-left font-normal",
                            !startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "yyyy-MM-dd") : <span>Pilih Tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarLazy
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <span className="text-sm text-gray-500">s/d</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full md:w-[150px] justify-start text-left font-normal",
                            !endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "yyyy-MM-dd") : <span>Pilih Tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarLazy
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => {
                      if (!startDate || !endDate) { toast.error('Pilih tanggal awal dan akhir'); return; }
                      if (startDate > endDate) { toast.error('Tanggal awal tidak boleh lebih besar dari tanggal akhir'); return; }
                      loadRows(1, itemsPerPage, searchQuery);
                    }}>Tampilkan</Button>
                    <Button variant="secondary" onClick={() => { setStartDate(undefined); setEndDate(undefined); loadRows(1, itemsPerPage, searchQuery); }}>Clear</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (!startDate || !endDate) { toast.error('Pilih tanggal awal dan akhir'); return; }
                        if (startDate > endDate) { toast.error('Tanggal awal tidak boleh lebih besar dari tanggal akhir'); return; }
                        const url = new URL(`${getApiBaseUrl()}/api/v1/laporan/surat-keluar`);
                        url.searchParams.set('tgl_awal', format(startDate, 'yyyy-MM-dd'));
                        url.searchParams.set('tgl_akhir', format(endDate, 'yyyy-MM-dd'));
                        window.open(url.toString(), '_blank');
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="flex-grow-0">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-md">Catatan</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm text-muted-foreground">Gunakan Form disamping untuk melakukan penyaringan data</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground">
                  <li>Pilih Periode tanggal awal dan tanggal akhir</li>
                  <li>Klik tombol <Button variant="secondary" size="sm" className="h-6 mx-1">Tampilkan</Button> untuk menampilkan data</li>
                  <li>Klik tombol <Button variant="secondary" size="sm" className="h-6 mx-1"><Download className="h-3 w-3" /> Download</Button> untuk mendownload berupa file Excel</li>
                </ol>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">LAPORAN PERIODE: {formattedHeaderDate}</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Data Per Halaman:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => { const per = Number(value); setItemsPerPage(per); loadRows(1, per, searchQuery); }}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Pencarian..." 
                    className="w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => loadRows(1, itemsPerPage, searchQuery)} className="px-4">
                    <Search className="mr-2 h-4 w-4" /> Cari
                  </Button>
                </div>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {/* Removed skeletons for top controls (per-page/search) while loading */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {['No','No Surat','Tgl Surat','Tgl Input','Dibuat Oleh','Perihal','Tujuan','Jenis Surat','Lampiran'].map((_, i) => (
                            <TableHead key={i}>
                              <Skeleton className="h-4 w-24" />
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: itemsPerPage }).map((_, r) => (
                          <TableRow key={r}>
                            {Array.from({ length: 9 }).map((__, c) => (
                              <TableCell key={c}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px] min-w-[50px]">No</TableHead>
                          <TableHead className="w-[120px] min-w-[120px]">No Surat</TableHead>
                          <TableHead className="w-[80px] min-w-[80px]">Tgl Surat</TableHead>
                          <TableHead className="w-[80px] min-w-[80px]">Tgl Input</TableHead>
                          <TableHead className="w-[120px] min-w-[120px]">Dibuat Oleh</TableHead>
                          <TableHead className="w-[200px] min-w-[200px]">Perihal</TableHead>
                          <TableHead className="w-[200px] min-w-[200px]">Tujuan</TableHead>
                          <TableHead className="w-[100px] min-w-[100px]">Jenis Surat</TableHead>
                          <TableHead className="w-[80px] min-w-[80px]">Lampiran</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.length > 0 ? (
                          rows.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className="max-w-[50px] truncate">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                              <TableCell className="max-w-[120px] truncate">{row.no_surat || '-'}</TableCell>
                              <TableCell className="max-w-[80px] truncate">{row.tgl_surat}</TableCell>
                              <TableCell className="max-w-[80px] truncate">{row.tgl_catat}</TableCell>
                              <TableCell className="max-w-[120px] truncate">{row.user?.name || '-'}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{row.perihal}</TableCell>
                              <TableCell className="max-w-[200px] truncate">{row.tujuanUsers && row.tujuanUsers.length > 0 ? row.tujuanUsers.map(u => u.name).join(', ') : (row.tujuan || '-')}</TableCell>
                              <TableCell className="max-w-[100px] truncate">{row.kode_jenis}</TableCell>
                              <TableCell className="max-w-[80px]">
                                {row.file ? (
                                  <Button variant="link" size="sm" className="h-6 px-2" asChild>
                                    <a href={`${getApiBaseUrl()}/storage/surat_keluar/${row.file}`} target="_blank" rel="noopener noreferrer">Lihat File</a>
                                  </Button>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Tidak ada</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center">
                              Tidak ada data yang cocok dengan pencarian Anda.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      {(() => {
                        const hasData = total > 0 && rows.length > 0;
                        const start = hasData ? (currentPage - 1) * itemsPerPage + 1 : 0;
                        const end = hasData ? Math.min(start + rows.length - 1, total) : 0;
                        return `Menampilkan ${start}-${end} dari ${total} data`;
                      })()}
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) loadRows(currentPage - 1, itemsPerPage, searchQuery); }} className={cn({ 'pointer-events-none opacity-50': currentPage === 1 })} />
                        </PaginationItem>
                        {lastPage > 0 && Array.from({ length: lastPage }, (_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); if (i + 1 !== currentPage) loadRows(i + 1, itemsPerPage, searchQuery); }}>
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < lastPage) loadRows(currentPage + 1, itemsPerPage, searchQuery); }} className={cn({ 'pointer-events-none opacity-50': currentPage >= lastPage })} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}