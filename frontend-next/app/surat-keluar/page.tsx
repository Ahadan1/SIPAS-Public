'use client';

import { useState, ReactNode, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, MoreHorizontal, Archive, Printer, Send, Eye, Search, Pencil } from 'lucide-react';

// Sidebar and Navbar components
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Breadcrumb components
import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";

// shadcn/ui components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
// Lazy-load Calendar to avoid SSR/hydration issues and reduce bundle
const CalendarDynamic = dynamic(
  () => import('@/components/ui/calendar').then(m => m.Calendar),
  { ssr: false, loading: () => <div className="p-2"><div className="h-[280px] w-[280px] animate-pulse rounded-md bg-muted" /></div> }
);
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiFetch, getApiBaseUrl } from '@/lib/api';
import { fetchMe } from '@/lib/user';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchUnitKerja, type UnitKerjaItem } from '@/lib/ref';
import LembarPantauForm from '@/components/lembar-pantau-form';

// --- DATA & SCHEMAS ---
type SuratKeluarRow = {
  id: number;
  no: number;
  noSurat: string;
  tglSurat: string;
  tglInput: string;
  dibuatOleh: string;
  perihal: string;
  tujuan: string;
  jenisSurat: string;
  lampiran: string;
  filePath?: string | null;
};

const formSchema = z.object({
  unitKerja: z.string().min(1).default('BAS'),
  jenisSurat: z.string().min(1, { message: 'Jenis Surat is required' }),
  penandatangan: z.string().min(1, { message: 'Penandatangan is required' }),
  klasifikasi: z.string().min(1, { message: 'Klasifikasi is required' }),
  noAgenda: z.string().optional(),
  drafSurat: z.string().optional(),
  noSurat: z.string().optional(),
  tglSurat: z.date().optional(),
  perihal: z.string().min(1, { message: 'Perihal is required' }),
  // Require selecting at least one tujuan user
  tujuanUsers: z.array(z.number()).min(1, { message: 'Pilih minimal satu pengguna' }).default([]),
  file: z.any().optional(),
});
type FormInput = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

const jenisSuratOptions = [
  '~ PILIH ~', 'Keputusan', 'Surat Edaran', 'Surat Tugas', 'Prosedur Operasional Baku', 'Nota Dinas',
];

const penandatanganOptions = [
  '~ PILIH ~', 'Dua Direktur D', 'Direktur SIL D1', 'Wakil Dir SIL D1.1', 'Direktur SKSG D2', 'Wakil Dir SKSG D2.1'
];

const klasifikasiOptions = [
  '~ PILIH ~', 'PDP.00 Kemahasiswaan', 'PDP.00.00 Perencanaan Penerimaan Mahasiswa', 'PDP.00.01 Seleksi Penerimaan Mahasiswa', 'PDP.00.01.00 Pelaksanaan Penerimaan Mahasiswa', 'PDP.04.02 Tesis/Desertasi'
];

type TableColumn = { header: string; accessorKey: keyof SuratKeluarRow; size?: string };

function SuratKeluarTable({ data, columns, currentPage, itemsPerPage, onPageChange, onItemsPerPageChange, onDetail, onEdit, onDelete, onLembarPantau, onViewLembarPantau }: {
  data: SuratKeluarRow[];
  columns: TableColumn[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
  onDetail: (row: SuratKeluarRow) => void;
  onEdit: (row: SuratKeluarRow) => void;
  onDelete: (row: SuratKeluarRow) => void;
  onLembarPantau: (row: SuratKeluarRow) => void;
  onViewLembarPantau: (row: SuratKeluarRow) => void;
}) {
  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="itemsPerPage">Data per halaman:</Label>
          <Select onValueChange={(value) => onItemsPerPageChange(Number(value))} value={String(itemsPerPage)}>
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
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index} style={{ width: col.size, maxWidth: col.size }}>{col.header}</TableHead>
              ))}
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col, colIndex) => {
                  const cellContent = row[col.accessorKey];
                  if (col.accessorKey === 'lampiran') {
                    return (
                      <TableCell key={colIndex} style={{ width: col.size, maxWidth: col.size, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.filePath ? (
                          <a className="text-primary hover:underline" href={row.filePath} target="_blank" rel="noreferrer">Download File</a>
                        ) : (
                          <span>Tidak ada file</span>
                        )}
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell key={colIndex} style={{ width: col.size, maxWidth: col.size, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cellContent as any}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* 1. Diarsipkan */}
                      <DropdownMenuItem
                        className="flex items-center space-x-2"
                        onClick={async () => {
                          try {
                            if (!row?.id) throw new Error('ID surat tidak ditemukan');
                            await apiFetch(`/api/v1/surat-keluar/${row.id}/arsip`, {
                              method: 'POST',
                              auth: true,
                              parseJson: true,
                            });
                            const { toast } = await import('sonner');
                            toast.success('Surat diarsipkan');
                          } catch (e: any) {
                            const { toast } = await import('sonner');
                            toast.error(e?.message || 'Gagal mengarsipkan surat');
                          }
                        }}
                      >
                        <Archive className="w-4 h-4" /><span>Diarsipkan</span>
                      </DropdownMenuItem>

                      {/* 2. Buat Lembar Pantau */}
                      <DropdownMenuItem className="flex items-center space-x-2" onClick={() => onLembarPantau(row)}>
                        <Send className="w-4 h-4" /><span>Buat Lembar Pantau</span>
                      </DropdownMenuItem>

                      {/* 3. Lihat Lembar Pantau */}
                      <DropdownMenuItem className="flex items-center space-x-2" onClick={() => onViewLembarPantau(row)}>
                        <Eye className="w-4 h-4" /><span>Lihat Lembar Pantau</span>
                      </DropdownMenuItem>

                      {/* 4. Print Surat */}
                      <DropdownMenuItem className="flex items-center space-x-2" onClick={() => console.log('Print Surat clicked')}>
                        <Printer className="w-4 h-4" /><span>Print Surat</span>
                      </DropdownMenuItem>

                      {/* 5. Detail */}
                      <DropdownMenuItem className="flex items-center space-x-2" onClick={() => onDetail(row)}>
                        <Eye className="w-4 h-4" /><span>Detail</span>
                      </DropdownMenuItem>

                      {/* 6. Edit */}
                      <DropdownMenuItem className="flex items-center space-x-2" onClick={() => onEdit(row)}>
                        <Pencil className="w-4 h-4" /><span>Edit</span>
                      </DropdownMenuItem>

                      {/* 7. Delete */}
                      <DropdownMenuItem className="flex items-center space-x-2 text-red-600" onClick={() => onDelete(row)}>
                        <Archive className="w-4 h-4" /><span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          Menampilkan {startIndex + 1}-{Math.min(endIndex, totalItems)} dari {totalItems} data
        </div>
        <Pagination>
          <PaginationContent>
            {currentPage === 1 ? (
              <PaginationPrevious className="pointer-events-none opacity-50" />
            ) : (
              <PaginationPrevious href="#" onClick={() => onPageChange(currentPage - 1)} />
            )}
            {pageNumbers.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink href="#" onClick={() => onPageChange(page)} isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            {currentPage === totalPages ? (
              <PaginationNext className="pointer-events-none opacity-50" />
            ) : (
              <PaginationNext href="#" onClick={() => onPageChange(currentPage + 1)} />
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}

const suratKeluarColumns: TableColumn[] = [
  { header: 'No', accessorKey: 'no', size: '50px' },
  { header: 'No Surat', accessorKey: 'noSurat', size: '150px' },
  { header: 'Tgl Surat', accessorKey: 'tglSurat', size: '100px' },
  { header: 'Tgl Input', accessorKey: 'tglInput', size: '100px' },
  { header: 'Dibuat Oleh', accessorKey: 'dibuatOleh', size: '120px' },
  { header: 'Perihal', accessorKey: 'perihal', size: '200px' },
  { header: 'Tujuan', accessorKey: 'tujuan', size: '150px' },
  { header: 'Jenis Surat', accessorKey: 'jenisSurat', size: '120px' },
  { header: 'Lampiran', accessorKey: 'lampiran', size: '120px' },
];

// --- MAIN PAGE COMPONENT with Sidebar and Navbar layout ---
export default function SuratKeluarPage() {
  const [activeView, setActiveView] = useState('table');
  const [selectedSurat, setSelectedSurat] = useState<SuratKeluarRow | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<any | null>(null);
  const [selectedDrafSurat, setSelectedDrafSurat] = useState<string>('');
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [rows, setRows] = useState<SuratKeluarRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<UnitKerjaItem[]>([]);
  const [meKodeUk, setMeKodeUk] = useState<string>('');
  const [unitKerjaChangedByUser, setUnitKerjaChangedByUser] = useState(false);
  // Users for tujuan selection
  const [userOptions, setUserOptions] = useState<{ id: number; name: string; username?: string; kode_uk?: string | null; unit_kerja?: string | null }[]>([]);
  const [userQuery, setUserQuery] = useState('');
  // Delete confirmation dialog state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<SuratKeluarRow | null>(null);
  // Delete delay state
  const [deleteDelay, setDeleteDelay] = useState(0);
  const [deleting, setDeleting] = useState(false);
  // Lembar Pantau dialog state
  const [isLPDialogOpen, setIsLPDialogOpen] = useState(false);
  const [lpRow, setLpRow] = useState<SuratKeluarRow | null>(null);
  // Lihat Lembar Pantau dialog state
  const [isLPViewOpen, setIsLPViewOpen] = useState(false);
  const [lpViewRow, setLpViewRow] = useState<SuratKeluarRow | null>(null);
  type LembarPantauItem = { id: number; id_surat?: number; id_jabatan?: number | string; jabatan?: string; catatan?: string | null; tgl_paraf?: string | null };
  const [lpItems, setLpItems] = useState<LembarPantauItem[]>([]);
  const [lpLoading, setLpLoading] = useState(false);
  const [lpError, setLpError] = useState<string | null>(null);

  // Search state for filtering visible columns
  const [searchQuery, setSearchQuery] = useState('');

  // SSR metadata handled by layout
  const filteredRows = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return rows;
    const keys = suratKeluarColumns.map(c => c.accessorKey);
    return rows.filter((r) =>
      keys.some((k) => {
        const v = (r as any)?.[k];
        if (v == null) return false;
        return String(v).toLowerCase().includes(q);
      })
    );
  }, [rows, searchQuery]);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (value: number) => { setItemsPerPage(value); setCurrentPage(1); };

  const form = useForm<FormInput>({
    resolver: zodResolver<FormInput, any, FormOutput>(formSchema),
    defaultValues: {
      unitKerja: '~ PILIH ~',
      jenisSurat: '~ PILIH ~',
      penandatangan: '~ PILIH ~',
      klasifikasi: '~ PILIH ~',
      noAgenda: '',
      drafSurat: '',
      noSurat: '',
      tglSurat: undefined,
      perihal: '',
      tujuanUsers: [],
    },
  });

  // loadRows implemented later after mapping helper

  useEffect(() => {
    loadRows();
    // Load Unit Kerja options
    (async () => {
      try {
        const items = await fetchUnitKerja();
        setUnitKerjaOptions(items);
      } catch {}
    })();
    // Load current user for default Unit Kerja
    (async () => {
      try {
        const me = await fetchMe();
        const kode = (me as any)?.kode_uk || (me as any)?.unit_kerja || '';
        setMeKodeUk(String(kode || ''));
        // Apply default to form if empty
        const v = form.getValues('unitKerja');
        if ((!v || v === '') && kode) {
          form.setValue('unitKerja', String(kode));
        }
      } catch {}
    })();
  }, []);

  // Watch Unit Kerja from the form
  const unitKerja = form.watch('unitKerja');

  // Prune selected tujuan users only when Unit Kerja changed by the USER
  useEffect(() => {
    if (!unitKerjaChangedByUser) return;
    const selected: number[] = form.getValues('tujuanUsers') || [];
    if (!selected.length) return;
    const targetUK = unitKerja ? String(unitKerja).toUpperCase() : '';
    const kept = selected.filter((id) => {
      const u = userOptions.find((x) => x.id === id);
      if (!u) return false;
      if (!targetUK) return true; // if no unit selected, keep
      const uk = String(u.kode_uk || u.unit_kerja || '').toUpperCase();
      return uk === targetUK;
    });
    if (kept.length !== selected.length) {
      form.setValue('tujuanUsers', kept, { shouldValidate: true, shouldDirty: true });
    }
  }, [unitKerja, userOptions, unitKerjaChangedByUser]);

  // Load users for tujuan selection (all users)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await apiFetch('/api/v1/users?per_page=1000', { method: 'GET', auth: true, parseJson: true });
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.users)
          ? res.users
          : [];
        setUserOptions(list.map((u: any) => ({ id: Number(u.id), name: String(u.name || u.nama || ''), username: u.username ? String(u.username) : undefined, kode_uk: u.kode_uk ?? null, unit_kerja: u.unit_kerja ?? null })));
      } catch (e) {
        // silent fail; tujuan selector will be empty
      }
    };
    loadUsers();
  }, []);

  const apiBase = getApiBaseUrl();

  const mapApiToRows = (items: any[]): SuratKeluarRow[] => {
    return items.map((item, idx) => {
      const filePath = item.file ? `${apiBase}/storage/${item.file}` : null;
      return {
        id: item.id_surat ?? item.id ?? idx,
        no: idx + 1,
        noSurat: item.no_surat || '-',
        tglSurat: item.tgl_surat || '-',
        tglInput: item.tgl_catat || item.created_at || '-',
        // Prefer related user.username, then user.name, then createdby
        dibuatOleh: (item.user?.username ?? item.user?.name ?? item.createdby ?? '-') ,
        perihal: item.perihal || '-',
        // Prefer tujuan users relation names if provided; support tujuan_users or tujuanUsers
        tujuan: (() => {
          const rel: any[] | null = Array.isArray(item.tujuan_users)
            ? item.tujuan_users
            : (Array.isArray(item.tujuanUsers) ? item.tujuanUsers : null);
          if (rel && rel.length > 0) {
            const names = rel
              .map((u: any) => (u?.name ?? u?.nama ?? u?.username))
              .filter((v: any) => typeof v === 'string' && v.length > 0);
            if (names.length > 0) return names.join(', ');
          }
          return item.tujuan || '-';
        })(),
        jenisSurat: item.kode_jenis || '-',
        lampiran: filePath ? 'Download File' : 'Tidak ada file',
        filePath,
      };
    });
  };

  const loadRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/v1/surat-keluar', { method: 'GET', auth: true, parseJson: true });
      const items = Array.isArray(response) ? response : (response?.data ?? []);
      // Sort by database created_at (fallback tgl_catat) ASC (oldest first)
      const sorted = [...items].sort((a: any, b: any) => {
        const aDateStr = a?.created_at ?? a?.tgl_catat ?? '';
        const bDateStr = b?.created_at ?? b?.tgl_catat ?? '';
        const aTime = aDateStr ? new Date(aDateStr).getTime() : 0;
        const bTime = bDateStr ? new Date(bDateStr).getTime() : 0;
        return aTime - bTime;
      });
      setRows(mapApiToRows(sorted));
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat Surat Keluar');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    const fd = new FormData();
    // Map frontend fields to backend
    if (data.perihal) fd.append('perihal', data.perihal);
    // Append tujuan user ids (multiple allowed)
    if (Array.isArray(data.tujuanUsers)) {
      data.tujuanUsers.forEach((id) => fd.append('tujuan_user_ids[]', String(id)));
    }
    // Also persist a human-readable tujuan string for DB column `tujuan`
    if (Array.isArray(data.tujuanUsers) && data.tujuanUsers.length > 0) {
      const names = data.tujuanUsers
        .map((id) => userOptions.find((u) => u.id === id)?.name)
        .filter((n): n is string => Boolean(n));
      if (names.length > 0) fd.append('tujuan', names.join(', '));
    }
    if (data.noSurat) fd.append('no_surat', data.noSurat);
    if (data.jenisSurat && data.jenisSurat !== '~ PILIH ~') fd.append('kode_jenis', data.jenisSurat);
    if (data.klasifikasi && data.klasifikasi !== '~ PILIH ~') fd.append('kode_klasifikasi', data.klasifikasi);
    if (data.penandatangan && data.penandatangan !== '~ PILIH ~') fd.append('kode_penandatanganan', data.penandatangan);
    if (data.tglSurat) fd.append('tgl_surat', format(data.tglSurat, 'yyyy-MM-dd'));
    if (data.file instanceof File) fd.append('file', data.file);
    // Use Unit Kerja as kode_uk for now
    if (data.unitKerja) fd.append('kode_uk', data.unitKerja);
    if (data.drafSurat) fd.append('drafsurat', data.drafSurat);

    // If editing, use Laravel method spoofing for PATCH
    const isEdit = isEditing && editingId != null;
    if (isEdit) fd.append('_method', 'PATCH');

    setLoading(true);
    setError(null);
    try {
      const url = isEdit ? `/api/v1/surat-keluar/${editingId}` : '/api/v1/surat-keluar';
      await apiFetch(url, { method: 'POST', auth: true, body: fd, parseJson: true });
      setIsFormDialogOpen(false);
      setIsEditing(false);
      setEditingId(null);
      form.reset();
      await loadRows();
    } catch (e: any) {
      setError(e?.message || 'Gagal menyimpan Surat Keluar');
    } finally {
      setLoading(false);
    }
  };

  const handleDetail = async (row: SuratKeluarRow) => {
    setSelectedSurat(row);
    setSelectedDetail(null);
    setSelectedDrafSurat('');
    setDetailLoading(true);
    try {
      const detail = await apiFetch(`/api/v1/surat-keluar/${row.id}`, { method: 'GET', auth: true, parseJson: true });
      const d: any = detail || {};
      setSelectedDetail(d);
      setSelectedDrafSurat(String(d.drafsurat || ''));
    } catch {}
    finally {
      setDetailLoading(false);
    }
    setIsDetailDialogOpen(true);
  };

  const handleEdit = async (row: SuratKeluarRow) => {
    setIsEditing(true);
    setEditingId(row.id);
    try {
      const detail = await apiFetch(`/api/v1/surat-keluar/${row.id}`, { method: 'GET', auth: true, parseJson: true });
      const d: any = detail || {};
      const tujuanIds: number[] = Array.isArray(d.tujuan_users) ? d.tujuan_users.map((u: any) => Number(u.id)).filter((n: number) => !isNaN(n)) : [];
      form.setValue('unitKerja', String(d.kode_uk || meKodeUk || ''), { shouldDirty: false });
      form.setValue('jenisSurat', String(d.kode_jenis || '~ PILIH ~'));
      form.setValue('penandatangan', String(d.kode_penandatanganan || '~ PILIH ~'));
      form.setValue('klasifikasi', String(d.kode_klasifikasi || '~ PILIH ~'));
      form.setValue('noAgenda', String(d.no_agenda || ''));
      form.setValue('drafSurat', String(d.drafsurat || ''));
      form.setValue('noSurat', String(d.no_surat || ''));
      form.setValue('tujuanUsers', tujuanIds);
      const dateStr = d.tgl_surat ? String(d.tgl_surat) : '';
      const maybeDate = dateStr ? new Date(dateStr) : undefined;
      // @ts-ignore allow undefined
      form.setValue('tglSurat', isNaN(maybeDate as any) ? undefined : (maybeDate as Date));
      form.setValue('perihal', String(d.perihal || ''));
    } catch (e) {
      // Fallback to minimal prefill
      form.setValue('unitKerja', meKodeUk || '');
    }
    setIsFormDialogOpen(true);
  };

  const handleDelete = (row: SuratKeluarRow) => {
    setRowToDelete(row);
    setIsDeleteOpen(true);
    setDeleting(false);
  };

  const handleOpenLembarPantau = (row: SuratKeluarRow) => {
    setLpRow(row);
    setIsLPDialogOpen(true);
  };

  const handleViewLembarPantau = async (row: SuratKeluarRow) => {
    setLpViewRow(row);
    setIsLPViewOpen(true);
    setLpLoading(true);
    setLpError(null);
    try {
      // Try several possible endpoints/param keys
      const candidates = [
        `/api/v1/lembar-pantau?id_surat=${row.id}`,
        `/api/v1/lembar-pantau?surat_id=${row.id}`,
        `/api/v1/lembar_pantau?id_surat=${row.id}`,
        `/api/v1/lembar_pantau?surat_id=${row.id}`,
        `/api/v1/surat-keluar/${row.id}/lembar-pantau`,
        `/api/v1/surat-keluar/${row.id}/lembar_pantau`,
        `/api/lembar-pantau?id_surat=${row.id}`,
        `/api/lembar-pantau?surat_id=${row.id}`,
        `/api/lembar_pantau?id_surat=${row.id}`,
        `/api/lembar_pantau?surat_id=${row.id}`,
        `/lembar-pantau?id_surat=${row.id}`,
        `/lembar-pantau?surat_id=${row.id}`,
        `/lembar_pantau?id_surat=${row.id}`,
        `/lembar_pantau?surat_id=${row.id}`,
      ];
      let found: any[] | null = null;
      for (const path of candidates) {
        try {
          const res: any = await apiFetch(path, { auth: true });
          const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          if (Array.isArray(data)) {
            found = data;
            break;
          }
        } catch (_e) {
          // try next
        }
      }
      if (!found) throw new Error('Endpoint Lembar Pantau tidak ditemukan.');
      setLpItems(found as LembarPantauItem[]);
    } catch (e: any) {
      setLpError(e?.message || 'Gagal memuat lembar pantau');
      setLpItems([]);
    } finally {
      setLpLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;
    setDeleting(true);
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/surat-keluar/${rowToDelete.id}`, { method: 'DELETE', auth: true, parseJson: true });
      await loadRows();
      setIsDeleteOpen(false);
      setRowToDelete(null);
    } catch (e: any) {
      setError(e?.message || 'Gagal menghapus Surat Keluar');
    } finally {
      setLoading(false);
      setDeleting(false);
    }
  };

  // Start a short countdown each time the delete dialog opens
  useEffect(() => {
    if (!isDeleteOpen) return;
    setDeleteDelay(2); // seconds
    const timer = setInterval(() => {
      setDeleteDelay((s) => {
        if (s <= 1) {
          clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isDeleteOpen]);

  const renderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            <FormField
              control={form.control}
              name="unitKerja"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Kerja</FormLabel>
                  <Select onValueChange={(v) => { setUnitKerjaChangedByUser(true); field.onChange(v); }} value={field.value}>
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
              )}
            />
            <FormField control={form.control} name="jenisSurat" render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Surat</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-11 whitespace-normal break-words text-left leading-snug">
                      <SelectValue placeholder="~ PILIH ~" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {jenisSuratOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="penandatangan" render={({ field }) => (
              <FormItem>
                <FormLabel>Penandatangan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-11 whitespace-normal break-words text-left leading-snug">
                      <SelectValue placeholder="~ PILIH ~" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {penandatanganOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="klasifikasi" render={({ field }) => (
              <FormItem>
                <FormLabel>Klasifikasi</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="min-h-11 whitespace-normal break-words text-left leading-snug">
                      <SelectValue placeholder="~ PILIH ~" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {klasifikasiOptions.map((option) => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="noAgenda" render={({ field }) => (<FormItem><FormLabel>No Agenda</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <div className="space-y-4">
            <FormField control={form.control} name="noSurat" render={({ field }) => (<FormItem><FormLabel>No. Surat</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="tglSurat" render={({ field }) => (
              <FormItem>
                <FormLabel>Tgl Surat</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                        {field.value ? format(field.value, 'PPP') : <span>Pilih Tanggal</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarDynamic mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="perihal" render={({ field }) => (
              <FormItem>
                <FormLabel>Perihal</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {/* Tujuan: users multi-select */}
            <FormField
              control={form.control}
              name="tujuanUsers"
              render={({ field }) => {
                const selected = field.value || [];
                const filtered = userOptions.filter(u => {
                  if (selected.includes(u.id)) return false;
                  if (userQuery === '') return true;
                  const q = userQuery.toLowerCase();
                  const qNoSpace = q.replace(/\s+/g, '');
                  const username = u.username ? u.username.toLowerCase() : '';
                  const usernameNoSpace = username.replace(/\s+/g, '');
                  const unitMatch = unitKerja
                    ? String(u.kode_uk || u.unit_kerja || '').toUpperCase() === String(unitKerja).toUpperCase()
                    : true;
                  return unitMatch && (
                    u.name.toLowerCase().includes(q) ||
                    username.includes(q) ||
                    usernameNoSpace.includes(qNoSpace) ||
                    String(u.id) === q
                  );
                });
                const addUser = (id: number) => {
                  if (!selected.includes(id)) field.onChange([...(selected || []), id]);
                  setUserQuery('');
                };
                const removeUser = (id: number) => {
                  field.onChange((selected as number[]).filter((v) => v !== id));
                };
                return (
                  <FormItem>
                    <FormLabel>
                      Tujuan (pengguna)
                      {userOptions && (
                        <span className="ml-1 text-xs text-muted-foreground">— {userOptions.length} pengguna dimuat</span>
                      )}
                    </FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Cari pengguna (nama/username)..."
                          value={userQuery}
                          onChange={(e) => setUserQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (filtered.length > 0) {
                                addUser(filtered[0].id);
                              }
                            }
                          }}
                        />
                        <Button type="button" variant="secondary" onClick={() => field.onChange(filtered.map(u => u.id))}>
                          Pilih semua
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const res = await apiFetch('/api/v1/users?per_page=1000', { method: 'GET', auth: true, parseJson: true });
                              const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
                              setUserOptions(list.map((u: any) => ({ id: Number(u.id), name: String(u.name || u.nama || ''), username: u.username ? String(u.username) : undefined, kode_uk: u.kode_uk ?? null, unit_kerja: u.unit_kerja ?? null })));
                            } catch {}
                          }}
                        >
                          Refresh
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Ketik untuk mencari (nama/username), lalu klik pada hasil untuk menambahkan. Anda bisa memilih lebih dari satu pengguna. Tekan Enter untuk memilih hasil teratas. Daftar difilter berdasarkan Unit Kerja yang dipilih.</p>
                      {filtered.length > 0 ? (
                        <div className="max-h-40 overflow-auto rounded border p-2 space-y-1">
                          {filtered.map((u) => (
                            <Button key={`uopt-${u.id}`} type="button" variant="ghost" className="justify-start h-auto px-2 py-1" onClick={() => addUser(u.id)}>
                              {u.name}{u.username ? ` (${u.username})` : ''}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground px-2">{userOptions.length === 0 ? 'Daftar pengguna belum dimuat. Klik Refresh.' : 'Tidak ada hasil'}</div>
                      )}
                      {selected.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selected.map((id: number) => {
                            const name = userOptions.find(u => u.id === id)?.name || String(id);
                            return (
                              <span key={`usel-${id}`} className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
                                {name}
                                <Button type="button" variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0" onClick={() => removeUser(id)}>×</Button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input id="file" type="file" onChange={(e) => {
                  const f = e.target.files?.[0];
                  // @ts-ignore
                  form.setValue('file', f);
                }} />
              </FormControl>
              <FormMessage />
            </FormItem>
          </div>
        </div>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="drafSurat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Draf Surat</FormLabel>
                <FormControl>
                  <Textarea placeholder="Type your letter draft here..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="secondary" onClick={() => setIsFormDialogOpen(false)}>Cancel</Button>
        </div>
      </form>
    </Form>
  );

  const renderDetail = () => (
    <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
      <DialogContent className="max-w-none h-[95vh] md:h-[70vh] overflow-y-auto w-[58vw] sm:max-w-[95vw] md:max-w-[96vw] lg:max-w-[92vw] xl:max-w-[88vw] 2xl:max-w-[1200px] px-4 pt-2 pb-3">
        <DialogHeader className="pb-0">
          <DialogTitle className="text-lg">Detail Surat Keluar</DialogTitle>
        </DialogHeader>
        {detailLoading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading detail...</div>
        ) : (
        <div className="space-y-2 -mt-4 md:-mt-5">
          {/* Top section: details (left) and file attachment (right) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-4">
              <div className="border rounded">
                <div className="border-b px-4 py-2 text-sm font-medium bg-muted">Detail Surat Keluar</div>
                <div className="p-3 pt-2">
                  <div className="text-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-2.5">
                    <div className="flex items-start gap-3"><span className="font-medium min-w-44">Perihal:</span><span className="break-words whitespace-normal">{selectedSurat?.perihal}</span></div>
                    <div className="flex items-start gap-3"><span className="font-medium min-w-44">No Surat:</span><span className="break-words whitespace-normal">{selectedDetail?.no_surat ?? selectedSurat?.noSurat}</span></div>
                    <div className="flex items-start gap-3"><span className="font-medium min-w-44">Jenis Surat:</span><span className="break-words whitespace-normal">{selectedDetail?.kode_jenis ?? selectedSurat?.jenisSurat}</span></div>
                    <div className="flex items-start gap-3"><span className="font-medium min-w-44">Klasifikasi:</span><span className="break-words whitespace-normal">{selectedDetail?.kode_klasifikasi ?? '-'}</span></div>
                    <div className="flex items-start gap-3"><span className="font-medium min-w-44">Tgl Surat:</span><span className="break-words whitespace-normal">{selectedDetail?.tgl_surat ?? selectedSurat?.tglSurat}</span></div>
                    <div className="lg:col-span-3 sm:col-span-2 flex items-start gap-3"><span className="font-medium min-w-44">Tujuan:</span><span className="break-words whitespace-pre-wrap">{selectedSurat?.tujuan}</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <div className="border rounded">
                <div className="border-b px-3 py-2 text-sm font-medium bg-muted">File Attachment</div>
                <div className="p-3 pt-2 text-sm">
                  {selectedSurat?.filePath ? (
                    <a className="text-primary hover:underline" href={selectedSurat.filePath} target="_blank" rel="noreferrer">Download File</a>
                  ) : (
                    <span>Tidak ada file</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Draft section */}
          <div className="border rounded">
            <div className="border-b px-4 py-2 text-sm font-medium bg-muted">Draf Surat</div>
            <div className="p-3 pt-2">
              {selectedDrafSurat ? (
                <div className="border rounded bg-card p-4 max-h-[50vh] overflow-auto text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {selectedDrafSurat}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">-</div>
              )}
            </div>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );

  const SuratKeluarBreadcrumb: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/surat-keluar">Surat Keluar</BreadcrumbLink>
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
        <SiteHeader breadcrumbs={SuratKeluarBreadcrumb} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 py-4 px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Surat Keluar</h1>
            {activeView === 'table' && (
              <Card>
                <CardContent className="pt-6">
                  {/* Corrected header: Buat Surat Keluar and Pencarian are now in one place */}
                  <div className="flex justify-between items-center mb-4">
                    <Dialog
                      open={isFormDialogOpen}
                      onOpenChange={(o) => {
                        if (!o) {
                          // Closing: clear edit state and reset form
                          setIsEditing(false);
                          setEditingId(null);
                          form.reset();
                          setUserQuery('');
                        }
                        if (o && userOptions.length === 0) {
                          // Ensure users are loaded when opening
                          (async () => {
                            try {
                              const res = await apiFetch('/api/v1/users?per_page=1000', { method: 'GET', auth: true, parseJson: true });
                              const list = Array.isArray(res)
                                ? res
                                : Array.isArray(res?.data)
                                ? res.data
                                : Array.isArray(res?.data?.data)
                                ? res.data.data
                                : Array.isArray(res?.users)
                                ? res.users
                                : [];
                              setUserOptions(list.map((u: any) => ({ id: Number(u.id), name: String(u.name || u.nama || ''), username: u.username ? String(u.username) : undefined })));
                            } catch {}
                          })();
                        }
                        setIsFormDialogOpen(o);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => {
                            // Opening new draft: ensure fresh form
                            setIsEditing(false);
                            setEditingId(null);
                            form.reset();
                            setUserQuery('');
                          }}
                        >
                          Buat Surat Keluar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[98vw] max-w-[1400px] lg:max-w-[1600px] max-h-[95vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{isEditing ? 'Edit Surat Keluar' : 'Buat Surat Keluar'}</DialogTitle>
                        </DialogHeader>
                        {renderForm()}
                      </DialogContent>
                    </Dialog>

                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Pencarian..."
                        className="w-[200px]"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      />
                      <Button variant="secondary" onClick={() => setCurrentPage(1)}>
                        <Search className="w-4 h-4 mr-2" />Cari
                      </Button>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                      {error}
                    </div>
                  )}
                  {loading ? (
                    <div className="space-y-4">
                      {/* Removed skeletons for header controls and per-page while loading */}
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {suratKeluarColumns.map((c, i) => (
                                <TableHead key={i} style={{ width: c.size, maxWidth: c.size }}>
                                  <Skeleton className="h-4 w-24" />
                                </TableHead>
                              ))}
                              <TableHead className="w-[100px]"><Skeleton className="h-4 w-20" /></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.from({ length: 8 }).map((_, r) => (
                              <TableRow key={r}>
                                {suratKeluarColumns.map((c, i) => (
                                  <TableCell key={i} style={{ width: c.size, maxWidth: c.size }}>
                                    <Skeleton className="h-4 w-full" />
                                  </TableCell>
                                ))}
                                <TableCell className="w-[100px]"><Skeleton className="h-8 w-8 rounded-md" /></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <SuratKeluarTable
                      data={filteredRows}
                      columns={suratKeluarColumns}
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      onPageChange={handlePageChange}
                      onItemsPerPageChange={handleItemsPerPageChange}
                      onDetail={handleDetail}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onLembarPantau={handleOpenLembarPantau}
                      onViewLembarPantau={handleViewLembarPantau}
                    />
                  )}
                </CardContent>
              </Card>
            )}
            {renderDetail()}
            {/* Dialog: Buat Lembar Pantau */}
            <Dialog open={isLPDialogOpen} onOpenChange={setIsLPDialogOpen}>
              <DialogContent className="max-w-none w-[58vw] sm:max-w-[95vw] md:max-w-[720px] lg:max-w-[780px] xl:max-w-[880px] px-2 md:px-4 py-2">
                <DialogHeader className="pb-0">
                  <DialogTitle className="text-lg">Buat Lembar Pantau</DialogTitle>
                </DialogHeader>
                <div className="-mt-2">
                  <LembarPantauForm
                    suratId={lpRow?.id ?? 0}
                    onSaved={() => { setIsLPDialogOpen(false); setLpRow(null); }}
                    onCancel={() => { setIsLPDialogOpen(false); setLpRow(null); }}
                    title="Form Lembar Pantau"
                  />
                </div>
              </DialogContent>
            </Dialog>
            {/* Dialog: Lihat Lembar Pantau */}
            <Dialog open={isLPViewOpen} onOpenChange={setIsLPViewOpen}>
              <DialogContent className="max-w-none w-[70vw] sm:max-w-[95vw] md:max-w-[860px] lg:max-w-[980px] xl:max-w-[1080px] px-2 md:px-4 py-3">
                <DialogHeader className="pb-1">
                  <DialogTitle className="text-lg">Daftar Lembar Pantau</DialogTitle>
                </DialogHeader>
                <Card className="bg-card">
                  <CardContent className="pt-6 space-y-4">
                    {/* Surat metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">No Surat</span><span className="font-medium">{lpViewRow?.noSurat || '-'}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Perihal</span><span className="font-medium truncate max-w-[60%] text-right">{lpViewRow?.perihal || '-'}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Tujuan</span><span className="font-medium truncate max-w-[60%] text-right">{lpViewRow?.tujuan || '-'}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">File</span><span className="font-medium">{lpViewRow?.filePath ? 'Tersedia' : 'Tidak ada file'}</span></div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Tgl Surat</span><span className="font-medium">{lpViewRow?.tglSurat || '-'}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Jenis Surat</span><span className="font-medium">{lpViewRow?.jenisSurat || '-'}</span></div>
                        <div className="flex items-center justify-between"><span className="text-muted-foreground">Klasifikasi</span><span className="font-medium">{(lpViewRow as any)?.klasifikasi || '-'}</span></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <Button variant="outline" size="sm" onClick={() => console.log('Print Lembar Pantau')}>Print Lembar Pantau</Button>
                    </div>

                    {/* Table */}
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-14">No</TableHead>
                            <TableHead>Jabatan</TableHead>
                            <TableHead>Catatan</TableHead>
                            <TableHead className="w-40">Tgl Paraf</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lpLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Memuat...</TableCell></TableRow>
                          ) : lpError ? (
                            <TableRow><TableCell colSpan={4} className="text-center text-destructive">{lpError}</TableCell></TableRow>
                          ) : lpItems.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Belum ada lembar pantau</TableCell></TableRow>
                          ) : (
                            lpItems.map((it, idx) => (
                              <TableRow key={it.id}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>{it.jabatan || it.id_jabatan || '-'}</TableCell>
                                <TableCell className="whitespace-pre-wrap">{it.catatan || '-'}</TableCell>
                                <TableCell>{it.tgl_paraf || '-'}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus surat ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Surat akan dihapus permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => { setIsDeleteOpen(false); setRowToDelete(null); }}>
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} disabled={deleteDelay > 0 || deleting}>
                    {deleting ? 'Menghapus...' : (deleteDelay > 0 ? `Hapus (${deleteDelay})` : 'Hapus')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}