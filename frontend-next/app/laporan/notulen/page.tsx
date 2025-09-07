'use client';

import { useEffect, useState, ReactNode, useMemo } from 'react';
import dynamic from 'next/dynamic';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Eye, Edit, Trash2 } from 'lucide-react';
import { apiFetch, getApiBaseUrl } from '@/lib/api';
import { fetchUnitKerja, type UnitKerjaItem } from '@/lib/ref';
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover, PopoverContent, PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
// Lazy load heavy UI widgets
const CalendarLazy = dynamic(() => import('@/components/ui/calendar').then(m => m.Calendar), {
  ssr: false,
  loading: () => <div className="p-2"><Skeleton className="h-[300px] w-full" /></div>,
});
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

// --- DATA & SCHEMAS ---
type Notulen = {
  id: number;
  user_id: number;
  nama_kegiatan: string;
  tanggal_kegiatan: string;
  keterangan?: string | null;
  file_path?: string | null;
  audio_path?: string | null;
  kode_uk: string;
};

const formSchema = z.object({
  namaKegiatan: z.string().min(1, { message: 'Nama Kegiatan is required' }),
  tglKegiatan: z.date(),
  fileUpload: z.any().optional(),
  fileAudio: z.any().optional(),
  keterangan: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// --- REUSABLE TABLE COMPONENT ---
function NotulenTable({ data, onDetailClick, onEditClick, onDeleteClick }: { data: Notulen[]; onDetailClick: (row: Notulen) => void; onEditClick: (row: Notulen) => void; onDeleteClick: (row: Notulen) => void; }) {
  // Removed `tableHeaderContent` from here
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No</TableHead>
            <TableHead>Nama Kegiatan</TableHead>
            <TableHead>Tgl Kegiatan</TableHead>
            <TableHead className="w-[100px] text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              <TableCell>{rowIndex + 1}</TableCell>
              <TableCell>{row.nama_kegiatan}</TableCell>
              <TableCell>{format(new Date(row.tanggal_kegiatan), 'yyyy-MM-dd')}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center space-x-2">
                  <Button variant="outline" size="icon" onClick={() => onDetailClick(row)}><Eye className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => onEditClick(row)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="outline" size="icon" onClick={() => onDeleteClick(row)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination moved to parent */}
    </>
  );
}

// --- MAIN PAGE COMPONENT with Sidebar and Navbar layout ---
export default function LaporanNotulenPage() {
  const [activeView, setActiveView] = useState('table');
  const [selectedNotulen, setSelectedNotulen] = useState<Notulen | null>(null);
  const [editingData, setEditingData] = useState<Notulen | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [rows, setRows] = useState<Notulen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [userKodeUk, setUserKodeUk] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Notulen | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<UnitKerjaItem[]>([]);
  const [selectedKodeUk, setSelectedKodeUk] = useState<string>('');


  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editingData ? {
      namaKegiatan: editingData.nama_kegiatan,
      tglKegiatan: new Date(editingData.tanggal_kegiatan),
      keterangan: editingData.keterangan || '',
    } : {
      namaKegiatan: '',
      tglKegiatan: undefined,
      keterangan: '',
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<any>('/api/user', { auth: true });
        const kode = me?.kode_uk || me?.unit_kerja?.kode_uk || null;
        setUserKodeUk(kode);
        if (!selectedKodeUk && kode) setSelectedKodeUk(kode);
      } catch {}
    })();
  }, []);

  // Load Unit Kerja options
  useEffect(() => {
    (async () => {
      try {
        const items = await fetchUnitKerja();
        setUnitKerjaOptions(items);
      } catch {}
    })();
  }, []);

  const loadRows = async (page = currentPage, perPage = itemsPerPage, q = query) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      if (q) {
        // Try common query param names
        params.set('search', q);
      }
      const res = await apiFetch<any>(`/api/v1/notulen?${params.toString()}`, { auth: true });
      const data: Notulen[] = res?.data ?? res ?? [];
      setRows(data);
      setCurrentPage(res?.current_page ?? page);
      setItemsPerPage(res?.per_page ?? perPage);
      setTotal(res?.total ?? data.length);
      setLastPage(res?.last_page ?? 1);
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(1, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side filtering over current page rows on visible columns only
  const filteredRows = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) => {
      const nama = (r.nama_kegiatan || '').toLowerCase();
      let tgl = '';
      try { tgl = format(new Date(r.tanggal_kegiatan), 'yyyy-MM-dd').toLowerCase(); } catch {}
      return nama.includes(q) || tgl.includes(q);
    });
  }, [rows, searchQuery]);

  const onSubmit = async (data: FormValues) => {
    if (saving) return; // prevent double submit
    try {
      setSaving(true);
      setError(null);
      const fd = new FormData();
      fd.set('nama_kegiatan', data.namaKegiatan);
      fd.set('tanggal_kegiatan', format(data.tglKegiatan, 'yyyy-MM-dd'));
      if (data.keterangan) fd.set('keterangan', data.keterangan);
      if (selectedKodeUk || userKodeUk) fd.set('kode_uk', selectedKodeUk || (userKodeUk as string));

      const values: any = form.getValues();
      const file: File | null = values.fileUpload || null;
      const audio: File | null = values.fileAudio || null;
      if (file instanceof File) fd.set('file', file);
      if (audio instanceof File) fd.set('audio', audio);

      if (editingData) {
        await apiFetch(`/api/v1/notulen/${editingData.id}`, { method: 'POST', headers: { 'X-HTTP-Method-Override': 'PUT' }, body: fd, auth: true, parseJson: true });
        toast.success('Notulen berhasil diperbarui');
      } else {
        await apiFetch('/api/v1/notulen', { method: 'POST', body: fd, auth: true, parseJson: true });
        toast.success('Notulen berhasil ditambahkan');
      }
      await loadRows();
      setIsFormDialogOpen(false);
      form.reset();
      setEditingData(null);
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan data');
      toast.error(e.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDetailClick = (notulen: Notulen) => {
    setSelectedNotulen(notulen);
    setActiveView('detail');
  };

  const handleEditClick = (notulen: Notulen) => {
    setEditingData(notulen);
    form.reset({
      namaKegiatan: notulen.nama_kegiatan,
      tglKegiatan: new Date(notulen.tanggal_kegiatan),
      keterangan: notulen.keterangan || '',
    });
    setSelectedKodeUk(notulen.kode_uk || '');
    setIsFormDialogOpen(true); // Open dialog for editing
  };

  const handleDeleteClick = (row: Notulen) => {
    setRowToDelete(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete?.id) return;
    try {
      setDeleting(true);
      await apiFetch(`/api/v1/notulen/${rowToDelete.id}`, { method: 'DELETE', auth: true, parseJson: false });
      setConfirmOpen(false);
      setRowToDelete(null);
      await loadRows();
      toast.success('Notulen berhasil dihapus');
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus data');
      toast.error(e.message || 'Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  // Render function for the form without the Card wrapper
  const renderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="namaKegiatan" render={({ field }) => ( <FormItem><FormLabel>Nama Kegiatan</FormLabel><FormControl><Input disabled={saving} {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="tglKegiatan" render={({ field }) => ( <FormItem><FormLabel>Tgl Kegiatan</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button disabled={saving} variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP') : <span>Pilih Tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><CalendarLazy mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
          {/* Unit Kerja Select */}
          <div>
            <FormLabel>Unit Kerja</FormLabel>
            <Select value={selectedKodeUk || ''} onValueChange={(val) => setSelectedKodeUk(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Unit Kerja" />
              </SelectTrigger>
              <SelectContent>
                {unitKerjaOptions.map((opt) => (
                  <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <FormField control={form.control} name="fileUpload" render={({ field }) => (
            <FormItem>
              <FormLabel>File Upload</FormLabel>
              <FormControl>
                <Input disabled={saving} type="file" onChange={(e) => field.onChange(e.target.files?.[0] || null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="fileAudio" render={({ field }) => (
            <FormItem>
              <FormLabel>File Audio</FormLabel>
              <FormControl>
                <Input disabled={saving} type="file" accept="audio/*" onChange={(e) => field.onChange(e.target.files?.[0] || null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="keterangan" render={({ field }) => ( <FormItem className="col-span-1 md:col-span-2"><FormLabel>Keterangan</FormLabel><FormControl><Textarea placeholder="Keterangan" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          <Button type="submit" disabled={saving}>{saving ? 'Menyimpan...' : (editingData ? 'Update' : 'Save')}</Button>
          <Button variant="secondary" disabled={saving} onClick={() => { setIsFormDialogOpen(false); form.reset(); }}>Cancel</Button>
        </div>
      </form>
    </Form>
  );

  const renderDetail = () => (
    <Card className="p-4">
      <div className="flex justify-end items-center mb-4 space-x-2">
        <Button onClick={() => setActiveView('table')}>Kembali</Button>
      </div>
      <CardHeader>
        <CardTitle>Detail Laporan Notulen</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedNotulen && (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="font-semibold">Nama Kegiatan:</p><p>{selectedNotulen.nama_kegiatan}</p></div>
            <div><p className="font-semibold">Tgl Kegiatan:</p><p>{format(new Date(selectedNotulen.tanggal_kegiatan), 'PPP')}</p></div>
            <div><p className="font-semibold">File:</p>{selectedNotulen.file_path ? (
              <Button asChild variant="link" className="p-0 h-auto"><a href={`${getApiBaseUrl()}/storage/${selectedNotulen.file_path}`} target="_blank" rel="noreferrer">Download</a></Button>
            ) : (<span>-</span>)}</div>
            <div><p className="font-semibold">File Audio:</p>{selectedNotulen.audio_path ? (
              <audio controls className="w-full"><source src={`${getApiBaseUrl()}/storage/${selectedNotulen.audio_path}`} /></audio>
            ) : (<span>-</span>)}</div>
            <div><p className="font-semibold">Keterangan:</p><p>{selectedNotulen.keterangan || '-'}</p></div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const NotulenBreadcrumb: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbPage>Laporan</BreadcrumbPage>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/laporan/notulen">Notulen</BreadcrumbLink>
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
        <SiteHeader breadcrumbs={NotulenBreadcrumb} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 py-4 px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Data Laporan Notulen</h1>
            {activeView === 'table' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2 items-center">
                      <Dialog open={isFormDialogOpen} onOpenChange={(open) => {
                        setIsFormDialogOpen(open);
                        if (open && !editingData) {
                          // When opening for create, ensure clean form
                          form.reset({ namaKegiatan: '', tglKegiatan: undefined, keterangan: '', fileUpload: undefined as any, fileAudio: undefined as any });
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
                            setEditingData(null);
                            form.reset({ namaKegiatan: '', tglKegiatan: undefined, keterangan: '', fileUpload: undefined as any, fileAudio: undefined as any });
                            setSelectedKodeUk(userKodeUk || '');
                            setIsFormDialogOpen(true);
                          }}>+ Tambah Data</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-screen-lg max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Formulir Laporan Notulen</DialogTitle>
                          </DialogHeader>
                          {renderForm()}
                        </DialogContent>
                      </Dialog>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="data-per-halaman">Data Per Halaman</Label>
                        <Select value={String(itemsPerPage)} onValueChange={(val) => { const per = parseInt(val); setItemsPerPage(per); loadRows(1, per); }}>
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
                    </div>
                    <div className="flex items-center space-x-2 ml-auto">
                      <Input
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        placeholder="Pencarian..."
                        className="w-[200px]"
                      />
                      <Button onClick={() => setCurrentPage(1)}>Cari</Button>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
                  )}
                  {loading ? (
                    <div className="space-y-4">
                      {/* Removed skeletons for top controls (per-page/search) while loading */}
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              {['No','Nama Kegiatan','Tgl Kegiatan','Action'].map((_, i) => (
                                <TableHead key={i}>
                                  <Skeleton className="h-4 w-24" />
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.from({ length: itemsPerPage }).map((_, r) => (
                              <TableRow key={r}>
                                {Array.from({ length: 4 }).map((__, c) => (
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
                      <NotulenTable 
                        data={filteredRows} 
                        onDetailClick={handleDetailClick} 
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                      />
                      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Notulen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini akan menghapus data notulen "{rowToDelete?.nama_kegiatan}" secara permanen. Tindakan tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} disabled={deleting}>
                              {deleting ? 'Menghapus...' : 'Hapus'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {/* Data summary and pagination (below table) */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                          {total > 0 && filteredRows.length > 0 ? (
                            (() => {
                              const start = (currentPage - 1) * itemsPerPage + 1;
                              const end = Math.min(start + filteredRows.length - 1, total);
                              return <>Menampilkan {start}-{end} dari {total} data</>;
                            })()
                          ) : (
                            <>Tidak ada data</>
                          )}
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) loadRows(currentPage - 1, itemsPerPage); }}>Prev</PaginationLink>
                            </PaginationItem>
                            {Array.from({ length: Math.min(5, lastPage) }).map((_, i) => {
                              // Generate simple window of pages starting at 1 for now
                              const page = i + 1;
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink href="#" isActive={page === currentPage} onClick={(e) => { e.preventDefault(); loadRows(page, itemsPerPage); }}>{page}</PaginationLink>
                                </PaginationItem>
                              );
                            })}
                            <PaginationItem>
                              <PaginationLink href="#" onClick={(e) => { e.preventDefault(); if (currentPage < lastPage) loadRows(currentPage + 1, itemsPerPage); }}>Next</PaginationLink>
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
            {activeView === 'detail' && renderDetail()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}