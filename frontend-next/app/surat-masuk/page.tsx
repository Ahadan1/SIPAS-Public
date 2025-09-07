'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  MoreHorizontal, 
  Archive, 
  Printer, 
  Send, 
  Eye, 
  FileEdit, 
  Trash2, 
  Search 
} from 'lucide-react';
import { toast, Toaster } from "sonner";

import { id } from 'date-fns/locale';
import { DisposisiForm } from '@/components/disposisi-form';

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
  BreadcrumbSeparator
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { apiFetch, getApiBaseUrl } from '@/lib/api';
// Lazy-load heavy calendar to reduce initial bundle
const CalendarDynamic = dynamic(
  () => import('@/components/ui/calendar').then(m => m.Calendar),
  { ssr: false, loading: () => <div className="p-4"><div className="h-[280px] w-[280px] animate-pulse rounded-md bg-muted" /></div> }
);
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchMe } from '@/lib/user';
import { fetchUnitKerja, type UnitKerjaItem } from '@/lib/ref';

// --- DATA & SCHEMAS ---

const formSchema = z.object({
  unitKerja: z.string().optional(),
  sifat: z.string().min(1, { message: 'Sifat is required' }),
  noAgenda: z.string().optional(),
  tglTerima: z.date().optional(),
  noSurat: z.string().optional(),
  tglSurat: z.date().optional(),
  perihal: z.string().min(1, { message: 'Perihal is required' }),
  dari: z.string().min(1, { message: 'Dari is required' }),
  kepada: z.string().min(1, { message: 'Kepada is required' }),
  tembusan: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }).optional(),
});
type FormValues = z.infer<typeof formSchema>;

const sifatOptions = ['~ PILIH ~', 'Rahasia', 'Segera'];

// --- Dynamic Metadata (client-side immediate updates) ---
function useDynamicSuratMasukTitle() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams?.get('q')?.trim();
    const tab = (searchParams?.get('tab') || 'surat-masuk').trim();
    const base = tab === 'surat-tembusan' ? 'Surat Tembusan' : 'Surat Masuk';
    const title = q ? `${base} · Pencarian: ${q}` : base;
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    const desc = q
      ? `${base}. Pencarian: ${q}`
      : (tab === 'surat-tembusan' ? 'Daftar surat tembusan.' : 'Daftar surat masuk.');
    if (meta) meta.setAttribute('content', desc);
  }, [searchParams]);
}

// --- REUSABLE TABLE COMPONENT ---
type SuratTableProps = {
  data: any[];
  columns: any[];
  onDetailClick: (row: any) => void;
  onFormClick?: () => void;
  onEditClick?: (row: any) => void;
  onDeleteClick?: (row: any) => void;
  onDibacaChange: (rowIndex: number, newValue: string, isTembusan: boolean) => void;
  isTembusanTable?: boolean;
  onDisposisiClick?: (row: any) => void;
  serverMeta?: { total?: number; per_page?: number; current_page?: number } | null;
  serverPaginated?: boolean;
};

function SuratTable(props: SuratTableProps) {
  const {
    data,
    columns,
    onDetailClick,
    onFormClick,
    onEditClick,
    onDeleteClick,
    onDibacaChange,
    isTembusanTable = false,
    onDisposisiClick,
    serverMeta,
    serverPaginated = false,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pageParam = isTembusanTable ? 'page_tembusan' : 'page';
  const perPageParam = isTembusanTable ? 'per_page_tembusan' : 'per_page';
  const qParam = isTembusanTable ? 'q_tembusan' : 'q';

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const v = Number(searchParams?.get(pageParam) || 1);
    return Number.isFinite(v) && v > 0 ? v : 1;
  });
  const [itemsPerPage, setItemsPerPage] = useState<number>(() => {
    const v = Number(searchParams?.get(perPageParam) || 10);
    return [10,25,50,100].includes(v) ? v : 10;
  });
  const [searchQuery, setSearchQuery] = useState<string>(() => searchParams?.get(qParam) || '');

  // Keep local state in sync when URL changes (back/forward, external updates)
  useEffect(() => {
    const p = Number(searchParams?.get(pageParam) || 1);
    const pp = Number(searchParams?.get(perPageParam) || 10);
    const q = searchParams?.get(qParam) || '';
    setCurrentPage(Number.isFinite(p) && p > 0 ? p : 1);
    setItemsPerPage([10,25,50,100].includes(pp) ? pp : 10);
    setSearchQuery(q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString(), isTembusanTable]);

  const updateUrlParam = (key: string, value: string | number | null | undefined) => {
    const sp = new URLSearchParams(searchParams?.toString() || '');
    if (value === null || value === undefined || value === '' || value === '0') {
      sp.delete(key);
    } else {
      sp.set(key, String(value));
    }
    router.replace(`${pathname}?${sp.toString()}`);
  };

  // Debounce URL updates for search to avoid excessive fetches
  useEffect(() => {
    const handle = setTimeout(() => {
      updateUrlParam(qParam, searchQuery || null);
      updateUrlParam(pageParam, 1);
    }, 300);
    return () => clearTimeout(handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, qParam, pageParam]);

  const filteredData = useMemo(() => {
    const q = (searchQuery || '').toString().toLowerCase().trim();
    if (!q) return data;
    // Search only displayed columns to avoid matching on non-user-visible or object fields
    const keys = (columns || []).map((c: any) => c.accessorKey);
    return (data || []).filter((row: any) => {
      return keys.some((key: string) => {
        const v = row?.[key];
        if (v == null) return false;
        return String(v).toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery, columns]);

  // Pagination logic
  const effectivePerPage = serverMeta?.per_page ? Number(serverMeta.per_page) : itemsPerPage;
  const totalItems = serverMeta?.total ? Number(serverMeta.total) : filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePerPage));
  const startIndex = (currentPage - 1) * effectivePerPage;
  const endIndex = Math.min(startIndex + effectivePerPage, totalItems);
  const paginatedData = serverPaginated ? filteredData : filteredData.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (value: string) => {
    const v = Number(value);
    setItemsPerPage(v);
    setCurrentPage(1);
    updateUrlParam(perPageParam, v);
    updateUrlParam(pageParam, 1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      updateUrlParam(pageParam, page);
    }
  };

  const tableHeaderContent = (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
      {onFormClick && (
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={onFormClick}>Buat Surat Masuk</Button>
          </DialogTrigger>
        </Dialog>
      )}
      <div className="flex items-center space-x-2 sm:ml-auto">
        <Input
          placeholder="Pencarian..."
          className="w-full sm:w-[200px]"
          value={searchQuery}
          onChange={(e) => {
            const v = e.target.value;
            setSearchQuery(v);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => {
          setCurrentPage(1);
          updateUrlParam(pageParam, 1);
        }}><Search className="h-4 w-4" /></Button>
      </div>
    </div>
  );

  

  const tembusanTableHeaderContent = (
    <div className="flex justify-end items-center mb-4">
      <div className="flex items-center space-x-2">
        <Input
          placeholder="Pencarian..."
          className="w-[200px]"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Button onClick={() => setCurrentPage(1)}><Search className="h-4 w-4" /></Button>
      </div>
    </div>
  );

  return (
    <>
      {isTembusanTable ? tembusanTableHeaderContent : tableHeaderContent}

      {/* Items per page selector */}
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-sm">Data per halaman:</span>
        <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
          <SelectTrigger id="data-per-halaman" className="w-[80px]">
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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index} className={col.className}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((col, colIndex) => {
                    const cellContent = row[col.accessorKey];
                    return (
                      <TableCell key={colIndex} className={col.className}>
                        {col.accessorKey === 'dibaca' ? (
                          <Select value={cellContent} onValueChange={(value) => onDibacaChange(startIndex + rowIndex, value, isTembusanTable)}>
                            <SelectTrigger className={cn('w-[120px] rounded-full', cellContent === 'Sudah' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Sudah">Sudah</SelectItem>
                              <SelectItem value="Belum">Belum</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : col.accessorKey === 'lampiran' ? (
                          <Button
                            variant="link"
                            className="h-4 p-0"
                            onClick={() => {
                              if (row.filePath) {
                                const q = new URLSearchParams({ path: row.filePath, name: row.noSurat || 'dokumen' });
                                window.open(`/viewer?${q.toString()}`, '_blank');
                              } else {
                                toast.info('File tidak tersedia');
                              }
                            }}
                          >
                            {cellContent ?? '-'}
                          </Button>
                        ) : col.accessorKey === 'action' ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isTembusanTable ? (
                                <DropdownMenuItem onClick={() => onDetailClick(row)} className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4" /><span>Detail</span>
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem className="flex items-center space-x-2" onClick={() => onDetailClick(row)}>
                                    <Eye className="w-4 h-4" /><span>Detail</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center space-x-2" onClick={() => onEditClick && onEditClick(row)}>
                                    <FileEdit className="w-4 h-4" /><span>Edit</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center space-x-2 text-red-600" onClick={() => onDeleteClick && onDeleteClick(row)}>
                                    <Trash2 className="w-4 h-4" /><span>Delete</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="flex items-center space-x-2"
                                    onClick={async () => {
                                      try {
                                        if (!row?.id) throw new Error('ID surat tidak ditemukan');
                                        await apiFetch(`/api/v1/surat-masuk/${row.id}/arsip`, {
                                          method: 'POST',
                                          auth: true,
                                          parseJson: true,
                                        });
                                        toast.success('Surat diarsipkan');
                                      } catch (e: any) {
                                        toast.error(e?.message || 'Gagal mengarsipkan surat');
                                      }
                                    }}
                                  >
                                    <Archive className="w-4 h-4" /><span>Diarsipkan</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center space-x-2" onClick={() => toast.info('Print Lembar Disposisi clicked')}>
                                    <Printer className="w-4 h-4" /><span>Print Lembar Disposisi</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center space-x-2" onClick={() => onDisposisiClick && onDisposisiClick(row)}>
                                    <Send className="w-4 h-4" /><span>Buat Disposisi</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="flex items-center space-x-2" onClick={() => toast.info('Lihat Riwayat Surat clicked')}>
                                    <Eye className="w-4 h-4" /><span>Lihat Riwayat Surat</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          (cellContent ?? '-')
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data yang cocok dengan pencarian Anda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan {totalItems > 0 ? (serverPaginated ? startIndex + 1 : startIndex + 1) : 0}
          {" "}sampai{" "}
          {serverPaginated ? Math.min(startIndex + (paginatedData.length || 0), totalItems) : endIndex}
          {" "}dari {totalItems} data
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                className={cn({ "pointer-events-none opacity-50": currentPage === 1 })}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={i + 1 === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(i + 1);
                  }}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                className={cn({ "pointer-events-none opacity-50": currentPage === totalPages })}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}

const suratMasukColumns = [
  { header: 'No', accessorKey: 'no', className: 'min-w-[50px]' },
  { header: 'No Agenda', accessorKey: 'noAgenda', className: 'min-w-[120px]' },
  { header: 'No Surat', accessorKey: 'noSurat', className: 'min-w-[200px] max-w-[250px] truncate' },
  { header: 'Perihal', accessorKey: 'perihal', className: 'min-w-[200px] max-w-[300px] truncate' },
  { header: 'Tgl Surat', accessorKey: 'tglSurat', className: 'min-w-[120px]' },
  { header: 'Penerima', accessorKey: 'penerima', className: 'min-w-[150px] max-w-[200px] truncate' },
  { header: 'Tgl Terima', accessorKey: 'tglTerima', className: 'min-w-[120px]' },
  { header: 'Pengirim', accessorKey: 'pengirim', className: 'min-w-[150px] max-w-[200px] truncate' },
  { header: 'Dibaca', accessorKey: 'dibaca', className: 'min-w-[120px]' },
  { header: 'Lampiran', accessorKey: 'lampiran', className: 'min-w-[100px]' },
  { header: 'Posisi Surat', accessorKey: 'posisiSurat', className: 'min-w-[150px] max-w-[200px] truncate' },
  { header: 'Action', accessorKey: 'action', className: 'min-w-[80px]' },
];

const suratTembusanColumns = [
  { header: 'No', accessorKey: 'no', className: 'min-w-[50px]' },
  { header: 'No Surat', accessorKey: 'noSurat', className: 'min-w-[200px] max-w-[250px] truncate' },
  { header: 'Perihal', accessorKey: 'perihal', className: 'min-w-[200px] max-w-[300px] truncate' },
  { header: 'Tgl Surat', accessorKey: 'tglSurat', className: 'min-w-[120px]' },
  { header: 'Penerima', accessorKey: 'penerima', className: 'min-w-[150px] max-w-[200px] truncate' },
  { header: 'Dibaca', accessorKey: 'dibaca', className: 'min-w-[120px]' },
  { header: 'Action', accessorKey: 'action', className: 'min-w-[80px]' },
];

// --- MAIN PAGE COMPONENT with Sidebar and Navbar layout ---
export default function SuratPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useDynamicSuratMasukTitle();
  const updateClientTitle = (tab: 'surat-masuk' | 'surat-tembusan') => {
    const q = searchParams?.get('q')?.trim();
    const base = tab === 'surat-tembusan' ? 'Surat Tembusan' : 'Surat Masuk';
    const title = q ? `${base} · Pencarian: ${q}` : base;
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    const desc = q
      ? `${base}. Pencarian: ${q}`
      : (tab === 'surat-tembusan' ? 'Daftar surat tembusan.' : 'Daftar surat masuk.');
    if (meta) meta.setAttribute('content', desc);
  };
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDisposisiDialogOpen, setIsDisposisiDialogOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<any>(null);
  const createFileRef = useRef<File | null>(null);

  // Use useState for data arrays
  const [suratMasuk, setSuratMasuk] = useState<any[]>([]);
  const [suratTembusan, setSuratTembusan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suratMasukMeta, setSuratMasukMeta] = useState<{ total?: number; per_page?: number; current_page?: number } | null>(null);
  const [tembusanMeta, setTembusanMeta] = useState<{ total?: number; per_page?: number; current_page?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<UnitKerjaItem[]>([]);

  // Helpers to sort rows by created time and renumber the "No" column
  const sortAndRenumber = (rows: any[]) => {
    const toTS = (v: any) => {
      if (!v) return 0;
      const d = new Date(v);
      const t = d.getTime();
      return isNaN(t) ? (typeof v === 'number' ? v : 0) : t;
    };
    const next = [...rows].sort((a, b) => toTS(b.createdAt) - toTS(a.createdAt));
    return next.map((r, i) => ({ ...r, no: i + 1 }));
  };

  // Dynamic options for Kepada and Tembusan from backend
  const [kepadaOptions, setKepadaOptions] = useState<string[]>(['~ PILIH ~']);
  const [tembusanOptions, setTembusanOptions] = useState<{ label: string; kode_uk: string }[]>([]);
  const [tembusanQuery, setTembusanQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function loadJabatan() {
      try {
        const list = await apiFetch('/api/v1/jabatan', { auth: true });
        const names: string[] = Array.isArray(list)
          ? list.map((j: any) => j?.nama_jabatan).filter(Boolean)
          : [];
        // Deduplicate by name to avoid duplicate React keys/options
        const uniqueNames = Array.from(new Set(names));

        // Build tembusan options from jabatan with kode_uk
        const rawOpts: { label: string; kode_uk: string }[] = Array.isArray(list)
          ? list
              .map((j: any) => ({
                label: j?.nama_jabatan ?? '-',
                kode_uk: (j?.kode_uk ?? j?.id ?? j?.nama_jabatan ?? '') + ''
              }))
              .filter(o => o.label && o.kode_uk)
          : [];
        // Deduplicate by kode_uk
        const seen = new Set<string>();
        const uniqueOpts = rawOpts.filter(o => {
          if (seen.has(o.kode_uk)) return false;
          seen.add(o.kode_uk);
          return true;
        });
        if (cancelled) return;
        setKepadaOptions(['~ PILIH ~', ...uniqueNames]);
        setTembusanOptions(uniqueOpts);
      } catch (e: any) {
        toast.error('Gagal memuat opsi jabatan');
      }
    }
    loadJabatan();
    return () => { cancelled = true };
  }, []);

  // Load Unit Kerja reference options
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const items = await fetchUnitKerja();
        if (mounted) setUnitKerjaOptions(items);
      } catch {/* ignore */}
    })();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Support backend pagination & search via URL params if present
        const urlParams = new URLSearchParams();
        const page = searchParams?.get('page') || '';
        const per_page = searchParams?.get('per_page') || '';
        const q = searchParams?.get('q') || '';
        if (page) urlParams.set('page', page);
        if (per_page) urlParams.set('per_page', per_page);
        if (q) urlParams.set('q', q);
        const endpoint = urlParams.toString() ? `/api/v1/surat-masuk?${urlParams.toString()}` : '/api/v1/surat-masuk';

        const res = await apiFetch<any>(endpoint, { auth: true, signal: controller.signal });
        const arr = Array.isArray((res as any)?.data) ? (res as any).data : Array.isArray(res) ? res : [];
        const mapped = arr.map((sm: any, idx: number) => ({
          id: sm.id,
          no: idx + 1,
          noAgenda: String(sm.id ?? '-'),
          noSurat: sm.document?.nomor_surat ?? sm.nomor_surat ?? sm.no_surat ?? '-',
          perihal: sm.document?.perihal ?? sm.perihal ?? '-',
          tglSurat: sm.document?.tanggal_surat ?? sm.tanggal_surat ?? sm.tgl_surat ?? '-',
          penerima: '-',
          tglTerima: sm.tanggal_diterima ?? sm.tgl_terima ?? '-',
          pengirim: sm.asal_surat ?? sm.pengirim ?? sm.asal ?? '-',
          dibaca: sm.status && sm.status !== 'Diterima' ? 'Sudah' : 'Belum',
          lampiran: 'Lihat File',
          posisiSurat: '-',
          action: '',
          filePath: sm.document?.file_path ?? sm.file_path ?? sm.filePath ?? null,
          createdAt: sm.created_at ?? sm.document?.created_at ?? sm.tanggal_diterima ?? sm.tgl_terima ?? sm.id,
        }));
        if (mounted) {
          setSuratMasuk(sortAndRenumber(mapped));
          const meta = (res as any)?.meta || (res as any)?.pagination || null;
          setSuratMasukMeta(meta ? {
            total: Number(meta.total ?? meta?.total_items ?? meta?.totalItems ?? 0),
            per_page: Number(meta.per_page ?? meta?.perPage ?? meta?.per_page ?? 0),
            current_page: Number(meta.current_page ?? meta?.currentPage ?? 1),
          } : null);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        if (mounted) setError(e?.message || 'Gagal memuat surat masuk');
        toast.error(e?.message || 'Gagal memuat surat masuk');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; controller.abort(); };
  }, [searchParams?.toString()]);

  // Load Surat Tembusan from backend API
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    async function loadTembusan() {
      setLoading(true);
      setError(null);
      try {
        // Support pagination/search via URL if provided (q, page, per_page)
        const urlParams = new URLSearchParams();
        const page = searchParams?.get('page_tembusan') || '';
        const per_page = searchParams?.get('per_page_tembusan') || '';
        const q = searchParams?.get('q_tembusan') || '';
        if (page) urlParams.set('page', page);
        if (per_page) urlParams.set('per_page', per_page);
        if (q) urlParams.set('q', q);
        const endpoint = urlParams.toString() ? `/api/v1/tembusan?${urlParams.toString()}` : '/api/v1/tembusan';

        const res = await apiFetch<any>(endpoint, { auth: true, signal: controller.signal });
        const arr: any[] = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        const mapped = arr.map((t: any, idx: number) => ({
          id: t.id,
          no: idx + 1,
          noSurat: t.document?.nomor_surat ?? '-',
          perihal: t.document?.perihal ?? '-',
          tglSurat: t.document?.tanggal_surat ?? '-',
          penerima: t.jabatan?.nama_jabatan ?? '-',
          dibaca: 'Belum',
          action: '',
          filePath: t.document?.file_path ?? null,
        }));
        if (mounted) {
          setSuratTembusan(mapped);
          const meta = (res as any)?.meta || (res as any)?.pagination || null;
          setTembusanMeta(meta ? {
            total: Number(meta.total ?? meta?.total_items ?? meta?.totalItems ?? 0),
            per_page: Number(meta.per_page ?? meta?.perPage ?? meta?.per_page ?? 0),
            current_page: Number(meta.current_page ?? meta?.currentPage ?? 1),
          } : null);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        if (mounted) setError(e?.message || 'Gagal memuat surat tembusan');
        toast.error(e?.message || 'Gagal memuat surat tembusan');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadTembusan();
    return () => { mounted = false; controller.abort(); };
  }, [searchParams?.toString()]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitKerja: '',
      sifat: '~ PILIH ~',
      noAgenda: '',
      tglTerima: undefined,
      noSurat: '',
      tglSurat: undefined,
      perihal: '',
      dari: '',
      kepada: '~ PILIH ~',
      tembusan: [],
    },
  });

  // Default Unit Kerja to logged-in user's kode_uk when creating new
  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        const kode = (me as any)?.kode_uk || (me as any)?.unit_kerja || '';
        const current = form.getValues('unitKerja');
        if ((!current || current === '') && kode) {
          form.setValue('unitKerja', String(kode));
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // Ensure create form opens with clean state
  const openCreateForm = () => {
    setSelectedSurat(null);
    form.reset({
      unitKerja: '',
      sifat: '~ PILIH ~',
      noAgenda: '',
      tglTerima: undefined,
      noSurat: '',
      tglSurat: undefined,
      perihal: '',
      dari: '',
      kepada: '~ PILIH ~',
      tembusan: [],
    });
    setIsFormDialogOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    // Prevent double submit from rapid clicks
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Helper function to format dates to strings before updating state
    const formatDates = (formData: FormValues) => {
      return {
        ...formData,
        tglTerima: formData.tglTerima ? format(formData.tglTerima, 'yyyy-MM-dd') : '',
        tglSurat: formData.tglSurat ? format(formData.tglSurat, 'yyyy-MM-dd') : '',
      };
    };

    const isEditing = !!selectedSurat;
    const toastTitle = isEditing ? 'Surat berhasil diperbarui!' : 'Surat berhasil dibuat!';
    const toastDescription = isEditing ?
      `Surat dengan No. Agenda ${data.noAgenda} telah berhasil diedit.` :
      `Surat baru dengan No. Agenda ${data.noAgenda} telah berhasil disimpan.`;

    try {
      if (isEditing && selectedSurat?.id) {
        // Persist edit to backend API
        const formatted = formatDates(data);
        const fd = new FormData();
        // Only append fields that are editable in this dialog
        fd.append('nomor_surat', formatted.noSurat || '');
        fd.append('perihal', formatted.perihal || '');
        fd.append('tanggal_surat', formatted.tglSurat || '');
        fd.append('asal_surat', formatted.dari || '');
        fd.append('tanggal_diterima', formatted.tglTerima || '');
        // Include tembusan (array of kode_uk) as JSON string if present
        if (Array.isArray(formatted.tembusan)) {
          fd.append('tembusan', JSON.stringify(formatted.tembusan));
        }
        // Keep temporary sane defaults for required fields the API expects
        fd.append('jenis_naskah_id', '1');
        fd.append('klasifikasi_id', '1');
        fd.append('sifat_keamanan', 'Biasa');
        fd.append('sifat_kecepatan', 'Biasa');
        if (createFileRef.current) {
          fd.append('file', createFileRef.current);
        }

        const updated = await apiFetch<any>(`/api/v1/surat-masuk/${selectedSurat.id}`, {
          method: 'PATCH',
          auth: true,
          body: fd,
        });

        // Map API response to table row
        const sm = updated;
        const updatedRow = {
          id: sm.id,
          no: selectedSurat.no, // keep existing row number
          noAgenda: String(sm.id ?? '-'),
          noSurat: sm.document?.nomor_surat ?? '-',
          perihal: sm.document?.perihal ?? '-',
          tglSurat: sm.document?.tanggal_surat ?? '-',
          penerima: selectedSurat.penerima ?? '-',
          tglTerima: sm.tanggal_diterima ?? '-',
          pengirim: sm.asal_surat ?? '-',
          dibaca: sm.status && sm.status !== 'Diterima' ? 'Sudah' : 'Belum',
          lampiran: 'Lihat File',
          posisiSurat: selectedSurat.posisiSurat ?? '-',
          action: '',
          filePath: sm.document?.file_path ?? selectedSurat.filePath ?? null,
          createdAt: sm.created_at ?? sm.document?.created_at ?? selectedSurat.createdAt ?? sm.tanggal_diterima ?? sm.id,
        };

        setSuratMasuk(prev => {
          const next = prev.map((row) => (row.id === selectedSurat.id ? { ...row, ...updatedRow } : row));
          return sortAndRenumber(next);
        });
        toast.success(toastTitle, { description: toastDescription });
        setIsEditDialogOpen(false);
      } else {
        // Create via backend API with FormData so it persists and has an id
        const file = createFileRef.current;
        if (!file) {
          toast.error('File wajib diunggah');
          return;
        }
        const formatted = formatDates(data);
        const fd = new FormData();
        fd.append('nomor_surat', formatted.noSurat || '');
        fd.append('perihal', formatted.perihal || '');
        fd.append('tanggal_surat', formatted.tglSurat || '');
        fd.append('asal_surat', formatted.dari || '');
        fd.append('tanggal_diterima', formatted.tglTerima || '');
        if (Array.isArray(formatted.tembusan)) {
          fd.append('tembusan', JSON.stringify(formatted.tembusan));
        }
        // Temporary sane defaults until selects are wired
        fd.append('jenis_naskah_id', '1');
        fd.append('klasifikasi_id', '1');
        fd.append('sifat_keamanan', 'Biasa');
        fd.append('sifat_kecepatan', 'Biasa');
        fd.append('file', file);

        const created = await apiFetch<any>('/api/v1/surat-masuk', { method: 'POST', auth: true, body: fd });
        // Map API response to table row
        const sm = created;
        const newRow = {
          id: sm.id,
          no: suratMasuk.length + 1,
          noAgenda: String(sm.id ?? '-'),
          noSurat: sm.document?.nomor_surat ?? '-',
          perihal: sm.document?.perihal ?? '-',
          tglSurat: sm.document?.tanggal_surat ?? '-',
          penerima: '-',
          tglTerima: sm.tanggal_diterima ?? '-',
          pengirim: sm.asal_surat ?? '-',
          dibaca: sm.status && sm.status !== 'Diterima' ? 'Sudah' : 'Belum',
          lampiran: 'Lihat File',
          posisiSurat: '-',
          action: '',
          filePath: sm.document?.file_path ?? null,
          createdAt: sm.created_at ?? sm.document?.created_at ?? sm.tanggal_diterima ?? sm.id,
        };
        setSuratMasuk(prev => sortAndRenumber([...(prev || []), newRow]));
        toast.success(toastTitle, { description: toastDescription });
        setIsFormDialogOpen(false);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menyimpan surat');
      return;
    } finally {
      form.reset();
      setSelectedSurat(null);
      createFileRef.current = null;
      setIsSubmitting(false);
    }
  };

  const handleDetailClick = (surat: any) => {
    // Always show detail as a dialog per requirement
    setSelectedSurat(surat);
    setIsDetailDialogOpen(true);
  };

  const handleDisposisiClick = (surat: any) => {
    setSelectedSurat(surat);
    setIsDisposisiDialogOpen(true);
  };

  const handleEditClick = (surat: any) => {
    // Always open edit as a dialog per requirement
    setSelectedSurat(surat);
    const parseDate = (val: any) => {
      if (!val || val === '-' ) return undefined;
      const d = new Date(val);
      return isNaN(d.getTime()) ? undefined : d;
    };
    form.reset({
      unitKerja: '',
      sifat: 'Segera',
      noAgenda: surat.noAgenda,
      tglTerima: parseDate(surat.tglTerima),
      noSurat: surat.noSurat,
      tglSurat: parseDate(surat.tglSurat),
      perihal: surat.perihal,
      dari: surat.pengirim,
      kepada: surat.posisiSurat,
      tembusan: [],
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (surat: any) => {
    setSelectedSurat(surat);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSurat?.id) return;
    try {
      await apiFetch(`/api/v1/surat-masuk/${selectedSurat.id}`, { method: 'DELETE', auth: true, parseJson: false });
      setSuratMasuk(prev => {
        const next = prev.filter((s: any) => s.id !== selectedSurat.id);
        return sortAndRenumber(next);
      });
      toast.success('Surat berhasil dihapus');
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menghapus surat');
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedSurat(null);
    }
  };

  const handleDibacaChange = async (rowIndex: number, newValue: string, isTembusan: boolean) => {
    if (isTembusan) {
      // Local only for tembusan table
      setSuratTembusan(prevData => {
        const newData = [...prevData];
        newData[rowIndex].dibaca = newValue;
        return newData;
      });
      return;
    }

    // Update UI optimistically
    const prev = suratMasuk[rowIndex];
    setSuratMasuk(prevData => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], dibaca: newValue };
      return newData;
    });

    // Persist to backend if we have an id
    const row = suratMasuk[rowIndex];
    if (!row?.id) return;
    try {
      // Prefer dedicated endpoints if available
      const endpoint = newValue === 'Sudah'
        ? `/api/v1/surat-masuk/${row.id}/dibaca`
        : `/api/v1/surat-masuk/${row.id}/belum`;
      await apiFetch(endpoint, { method: 'POST', auth: true, parseJson: false });
    } catch (primaryErr: any) {
      // Fallback to PATCH status when dedicated endpoint not available
      try {
        const status = newValue === 'Sudah' ? 'Dibaca' : 'Diterima';
        const fd = new FormData();
        fd.append('status', status);
        await apiFetch(`/api/v1/surat-masuk/${row.id}`, { method: 'PATCH', auth: true, body: fd, parseJson: false });
      } catch (e: any) {
        // Revert on error
        setSuratMasuk(prevData => {
          const newData = [...prevData];
          newData[rowIndex] = { ...newData[rowIndex], dibaca: prev?.dibaca };
          return newData;
        });
        toast.error(e?.message || primaryErr?.message || 'Gagal mengubah status dibaca');
      }
    }
  };

  const renderForm = (dialogTitle: string, onCancel: () => void) => (
    <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{dialogTitle}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField control={form.control} name="unitKerja" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Kerja</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="min-h-11 whitespace-normal break-words text-left leading-snug">
                        <SelectValue placeholder="~ PILIH ~" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitKerjaOptions.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="noAgenda" render={({ field }) => (<FormItem><FormLabel>No. Agenda</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="tglTerima" render={({ field }) => (<FormItem><FormLabel>Tgl Terima Surat</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP', { locale: id }) : <span>Pilih Tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><CalendarDynamic mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={id} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="noSurat" render={({ field }) => (<FormItem><FormLabel>No Surat</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="tglSurat" render={({ field }) => (<FormItem><FormLabel>Tgl Surat</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP', { locale: id }) : <span>Pilih Tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><CalendarDynamic mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={id} /></PopoverContent></Popover><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="perihal" render={({ field }) => (<FormItem><FormLabel>Perihal</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="dari" render={({ field }) => (<FormItem><FormLabel>Dari</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="space-y-2">
                <Label htmlFor="file">File (pdf/doc/docx)</Label>
                <Input id="file" type="file" accept=".pdf,.doc,.docx" onChange={(e) => { createFileRef.current = e.target.files?.[0] ?? null; }} />
              </div>
            </div>
            <div className="space-y-6">
              <FormField control={form.control} name="sifat" render={({ field }) => (<FormItem><FormLabel>Sifat</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="~ PILIH ~" /></SelectTrigger></FormControl><SelectContent>{sifatOptions.map((sifat, i) => (<SelectItem key={`sifat-${i}-${sifat}`} value={sifat}>{sifat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="kepada" render={({ field }) => (<FormItem><FormLabel>Kepada</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="~ PILIH ~" /></SelectTrigger></FormControl><SelectContent>{kepadaOptions.map((kepada, i) => (<SelectItem key={`kepada-${i}-${kepada}`} value={kepada}>{kepada}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
              <FormField
                control={form.control}
                name="tembusan"
                render={({ field }) => {
                  const kodeToLabel = Object.fromEntries(tembusanOptions.map(o => [o.kode_uk, o.label] as const));
                  const selected = field.value || [];
                  const filtered = tembusanOptions.filter(o =>
                    !selected.includes(o.kode_uk) &&
                    (tembusanQuery === '' ||
                      o.label.toLowerCase().includes(tembusanQuery.toLowerCase()) ||
                      o.kode_uk.toLowerCase().includes(tembusanQuery.toLowerCase()))
                  );
                  const addKode = (kode: string) => {
                    if (!selected.includes(kode)) field.onChange([...(selected || []), kode]);
                    setTembusanQuery('');
                  };
                  const removeKode = (kode: string) => {
                    field.onChange(selected.filter((k: string) => k !== kode));
                  };
                  return (
                    <FormItem>
                      <FormLabel>Tembusan</FormLabel>
                      <div className="space-y-2">
                        <Input
                          placeholder="Cari jabatan atau kode UK..."
                          value={tembusanQuery}
                          onChange={(e) => setTembusanQuery(e.target.value)}
                        />
                        {filtered.length > 0 && (
                          <div className="max-h-40 overflow-auto rounded border p-2 space-y-1">
                            {filtered.map((o, i) => (
                              <Button
                                key={`temb-opt-${i}-${o.kode_uk}`}
                                type="button"
                                variant="ghost"
                                className="justify-start text-left break-words whitespace-normal h-auto px-2 py-1 w-auto self-start"
                                onClick={() => addKode(o.kode_uk)}
                              >
                                {o.label} ({o.kode_uk})
                              </Button>
                            ))}
                          </div>
                        )}
                        {selected.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {selected.map((kode: string, i: number) => (
                              <span key={`temb-tag-${i}-${kode}`} className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs break-words">
                                {kodeToLabel[kode] || kode}
                                <Button type="button" variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0" onClick={() => removeKode(kode)}>×</Button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-6">
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );

  const renderDetail = () => (
    <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[80vh] overflow-y-auto [&>button]:hidden">
      <DialogHeader>
        <DialogTitle>Detail Surat</DialogTitle>
      </DialogHeader>
      <div>
        <div className="flex justify-start items-center mb-4 space-x-2">
          <Button onClick={() => setIsDetailDialogOpen(false)}>Kembali</Button>
          <Button>Diteruskan</Button>
          <Button>Print Disposisi</Button>
          <Button>Buat Disposisi</Button>
          <Button>Lihat Riwayat Surat</Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="font-semibold">No Agenda:</p><p>{selectedSurat?.noAgenda}</p></div>
          <div><p className="font-semibold">Tgl Diterima:</p><p>{selectedSurat?.tglTerima}</p></div>
          <div><p className="font-semibold">No Surat:</p><p>{selectedSurat?.noSurat}</p></div>
          <div><p className="font-semibold">Tgl Surat:</p><p>{selectedSurat?.tglSurat}</p></div>
          <div><p className="font-semibold">Perihal:</p><p>{selectedSurat?.perihal}</p></div>
          <div><p className="font-semibold">Derajat:</p><p>Segera</p></div>
          <div><p className="font-semibold">Dari:</p><p>{selectedSurat?.pengirim}</p></div>
          <div>
            <p className="font-semibold">File:</p>
            <Button
              variant="link"
              className="h-4 p-0"
              onClick={() => {
                if (selectedSurat?.filePath) {
                  const q = new URLSearchParams({ path: selectedSurat.filePath, name: selectedSurat.noSurat || 'dokumen' });
                  window.open(`/viewer?${q.toString()}`, '_blank');
                } else {
                  toast.info('File tidak tersedia');
                }
              }}
            >
              Lihat File
            </Button>
          </div>
          <div><p className="font-semibold">Kepada:</p><p>{selectedSurat?.penerima}</p></div>
          <div><p className="font-semibold">Tembusan:</p><p>Tembusan list here</p></div>
        </div>
      </div>
    </DialogContent>
  );

  const SuratMasukBreadcrumb = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/surat-masuk">Surat Masuk</BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

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
        <SiteHeader breadcrumbs={SuratMasukBreadcrumb} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 py-4 px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Surat Masuk</h1>
            <Tabs
              defaultValue={(searchParams?.get('tab') as 'surat-masuk' | 'surat-tembusan') || 'surat-masuk'}
              className="w-full"
              onValueChange={(v) => {
                const sp = new URLSearchParams(searchParams?.toString() || '');
                sp.set('tab', v);
                router.replace(`${pathname}?${sp.toString()}`);
                updateClientTitle(v as 'surat-masuk' | 'surat-tembusan');
              }}
            >
              <TabsList>
                <TabsTrigger value="surat-masuk">Surat Masuk ({suratMasuk.length})</TabsTrigger>
                <TabsTrigger value="surat-tembusan">Surat Tembusan ({suratTembusan.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="surat-masuk" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="space-y-4">
                        {/* Removed skeletons for header controls and per-page while loading */}
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {suratMasukColumns.map((c, i) => (
                                  <TableHead key={i} className={c.className}><Skeleton className="h-4 w-24" /></TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array.from({ length: 8 }).map((_, r) => (
                                <TableRow key={r}>
                                  {suratMasukColumns.map((c, i) => (
                                    <TableCell key={i} className={c.className}><Skeleton className="h-4 w-full" /></TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <SuratTable
                        data={suratMasuk}
                        columns={suratMasukColumns}
                        onDetailClick={handleDetailClick}
                        onFormClick={openCreateForm}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                        onDibacaChange={handleDibacaChange}
                        isTembusanTable={false}
                        onDisposisiClick={handleDisposisiClick}
                        serverMeta={suratMasukMeta}
                        serverPaginated={!!suratMasukMeta}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="surat-tembusan" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {loading ? (
                      <div className="space-y-4">
                        {/* Removed skeletons for header controls and per-page while loading */}
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                {suratTembusanColumns.map((c, i) => (
                                  <TableHead key={i} className={c.className}><Skeleton className="h-4 w-24" /></TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Array.from({ length: 8 }).map((_, r) => (
                                <TableRow key={r}>
                                  {suratTembusanColumns.map((c, i) => (
                                    <TableCell key={i} className={c.className}><Skeleton className="h-4 w-full" /></TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    ) : (
                      <SuratTable
                        data={suratTembusan}
                        columns={suratTembusanColumns}
                        onDetailClick={handleDetailClick}
                        onDibacaChange={handleDibacaChange}
                        isTembusanTable={true}
                        serverMeta={tembusanMeta}
                        serverPaginated={!!tembusanMeta}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>
      </SidebarInset>
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        {renderForm('Formulir Surat Masuk', () => {
          setIsFormDialogOpen(false);
          form.reset();
        })}
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {renderForm('Edit Surat Masuk', () => {
          setIsEditDialogOpen(false);
          setSelectedSurat(null);
          form.reset();
        })}
      </Dialog>
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        {renderDetail()}
      </Dialog>
      <Dialog open={isDisposisiDialogOpen} onOpenChange={setIsDisposisiDialogOpen}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buat Disposisi</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <DisposisiForm />
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus surat ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Ini akan menghapus surat dengan No. Agenda **{selectedSurat?.noAgenda}** secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster richColors closeButton />
    </SidebarProvider>
  );
}