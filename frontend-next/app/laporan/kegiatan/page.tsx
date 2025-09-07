'use client';

import { useEffect, useState, ReactNode, useMemo } from 'react';
import dynamic from 'next/dynamic';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Eye, Edit, Trash2, Download } from 'lucide-react';
import { apiFetch, getApiBaseUrl } from '@/lib/api';

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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
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
// Lazy-load Calendar to reduce bundle size and avoid SSR/hydration issues
const CalendarDynamic = dynamic(
  () => import('@/components/ui/calendar').then(m => m.Calendar),
  { ssr: false, loading: () => <div className="p-2"><div className="h-[280px] w-[280px] animate-pulse rounded-md bg-muted" /></div> }
);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
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
type Kegiatan = {
  id: number;
  user_id: number;
  nama_kegiatan: string;
  tanggal_kegiatan: string;
  file_path?: string | null;
  youtube_link?: string | null;
  keterangan?: string | null;
  kode_uk: string;
};

const formSchema = z.object({
  namaKegiatan: z.string().min(1, { message: 'Nama Kegiatan is required' }),
  tglKegiatan: z.date(),
  linkYoutube: z.string().url({ message: 'Invalid URL' }).optional().or(z.literal('')),
  fileUpload: z.any().optional(),

  keterangan: z.string().optional(),
  fotoKegiatan: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// --- REUSABLE TABLE COMPONENT ---
function KegiatanTable({ data, startIndex = 0, onDetailClick, onEditClick, onDeleteClick }: { data: Kegiatan[]; startIndex?: number; onDetailClick: (row: Kegiatan) => void; onEditClick: (row: Kegiatan) => void; onDeleteClick: (row: Kegiatan) => void; }) {

  // Removed `tableHeaderContent`
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
            <TableRow key={row.id ?? rowIndex}>
              <TableCell>{startIndex + rowIndex + 1}</TableCell>
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
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          {/* Pagination info will be rendered by parent using state; this placeholder removed */}
        </div>
      </div>
    </>
  );
}

// --- MAIN PAGE COMPONENT with Sidebar and Navbar layout ---
export default function LaporanKegiatanPage() {
  const [activeView, setActiveView] = useState('table');
  const [selectedKegiatan, setSelectedKegiatan] = useState<Kegiatan | null>(null);
  const [editingData, setEditingData] = useState<Kegiatan | null>(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [rows, setRows] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [userKodeUk, setUserKodeUk] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Kegiatan | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaKegiatan: '',
      tglKegiatan: undefined as any,
      linkYoutube: '',
      keterangan: '',
      fileUpload: undefined as any,
      fotoKegiatan: undefined as any,
    },
  });

  useEffect(() => {
    // fetch current user for kode_uk
    (async () => {
      try {
        const me = await apiFetch<any>("/api/user", { auth: true });
        const kode = me?.kode_uk || me?.unit_kerja?.kode_uk || null;
        setUserKodeUk(kode);
      } catch (e: any) {
        // ignore
      }
    })();
  }, []);

  const loadRows = async (page = currentPage, perPage = itemsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>(`/api/v1/kegiatan?page=${page}&per_page=${perPage}`, { auth: true });
      const data: Kegiatan[] = res?.data ?? res?.items ?? [];
      setRows(data);
      // Trust the requested page; some backends may not echo current_page correctly
      setCurrentPage(page);
      // Keep the locally selected itemsPerPage; don't overwrite with server default
      setItemsPerPage(perPage);
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

  // Client-side filter over current page rows, searching only visible columns
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

  // Ensure form is cleared when opening Tambah (no editingData)
  useEffect(() => {
    if (isFormDialogOpen && !editingData) {
      form.reset({
        namaKegiatan: '',
        tglKegiatan: undefined as any,
        linkYoutube: '',
        keterangan: '',
        fileUpload: undefined as any,
        fotoKegiatan: undefined as any,
      });
      setIsSubmitting(false);
    }
  }, [isFormDialogOpen, editingData, form]);

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return; // prevent double submit/upload
    setIsSubmitting(true);
    try {
      setError(null);
      const fd = new FormData();
      fd.set('nama_kegiatan', data.namaKegiatan);
      fd.set('tanggal_kegiatan', format(data.tglKegiatan, 'yyyy-MM-dd'));
      if (data.linkYoutube) fd.set('youtube_link', data.linkYoutube);
      if (data.keterangan) fd.set('keterangan', data.keterangan);
      if (userKodeUk) fd.set('kode_uk', userKodeUk);

      const fileCtrl: any = (form.getValues() as any).fileUpload;
      if (fileCtrl instanceof File) {
        fd.set('main_file', fileCtrl);
      }
      const fotos: any = (form.getValues() as any).fotoKegiatan;
      if (fotos && typeof fotos.length === 'number') {
        Array.from(fotos as FileList).forEach((f: any, idx: number) => {
          fd.append('photos[]', f);
        });
      }

      if (editingData) {
        await apiFetch(`/api/v1/kegiatan/${editingData.id}`, { method: 'POST', headers: { 'X-HTTP-Method-Override': 'PUT' }, body: fd, auth: true, parseJson: true });
      } else {
        await apiFetch('/api/v1/kegiatan', { method: 'POST', body: fd, auth: true, parseJson: true });
      }
      await loadRows();
      setIsFormDialogOpen(false);
      form.reset();
      setEditingData(null);
    } catch (e: any) {
      setError(e.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetailClick = (kegiatan: Kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setActiveView('detail');
  };

  const handleEditClick = (kegiatan: Kegiatan) => {
    setEditingData(kegiatan);
    form.reset({
      namaKegiatan: kegiatan.nama_kegiatan,
      tglKegiatan: new Date(kegiatan.tanggal_kegiatan),
      linkYoutube: kegiatan.youtube_link || '',
      keterangan: kegiatan.keterangan || '',
    });
    setIsFormDialogOpen(true); // Open dialog for editing
  };

  const handleDeleteClick = (kegiatan: Kegiatan) => {
    setRowToDelete(kegiatan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!rowToDelete?.id) return;
    setIsDeleting(true);
    setError(null);
    try {
      await apiFetch(`/api/v1/kegiatan/${rowToDelete.id}`, { method: 'DELETE', auth: true, parseJson: false });
      await loadRows();
      setIsDeleteDialogOpen(false);
      setRowToDelete(null);
    } catch (e: any) {
      setError(e.message || 'Gagal menghapus data');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelClick = () => {
    setActiveView('table');
    setEditingData(null);
  };

  // Render function for the form without the Card wrapper
  const renderForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="namaKegiatan" render={({ field }) => ( <FormItem><FormLabel>Nama Kegiatan</FormLabel><FormControl><Input {...field} autoFocus /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="tglKegiatan" render={({ field }) => ( <FormItem><FormLabel>Tgl Kegiatan</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP') : <span>Pilih Tanggal</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50" /></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><CalendarDynamic mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="linkYoutube" render={({ field }) => ( <FormItem><FormLabel>Link Youtube</FormLabel><FormControl><Input placeholder="https://www.youtube.com/watch?v=JxnGFj9EJD" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="fileUpload" render={({ field }) => (
            <FormItem>
              <FormLabel>File Upload</FormLabel>
              <FormControl>
                <Input type="file" onChange={(e) => field.onChange(e.target.files?.[0] || null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="keterangan" render={({ field }) => ( <FormItem className="col-span-1 md:col-span-2"><FormLabel>Keterangan</FormLabel><FormControl><Textarea placeholder="Keterangan" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <div className="space-y-2 mt-4">
          <Label>Foto Kegiatan</Label>
          <FormField control={form.control} name="fotoKegiatan" render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="file" multiple onChange={(e) => field.onChange(e.target.files || null)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-center space-x-4 mt-6">
          <Button type="submit" disabled={isSubmitting || loading}>{isSubmitting ? 'Saving...' : (editingData ? 'Update' : 'Save')}</Button>
          <Button type="button" variant="secondary" onClick={() => { setIsFormDialogOpen(false); form.reset(); setIsSubmitting(false); }}>Cancel</Button>
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
        <CardTitle>Detail Laporan Kegiatan</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedKegiatan && (
          <div className="grid grid-cols-2 gap-4">
            <div><p className="font-semibold">Nama Kegiatan:</p><p>{selectedKegiatan.nama_kegiatan}</p></div>
            <div><p className="font-semibold">Tgl Kegiatan:</p><p>{format(new Date(selectedKegiatan.tanggal_kegiatan), 'PPP')}</p></div>
            <div><p className="font-semibold">File:</p>{selectedKegiatan.file_path ? (
              <Button asChild variant="link" className="p-0 h-auto"><a href={`${getApiBaseUrl()}/storage/${selectedKegiatan.file_path}`} target="_blank" rel="noreferrer">Download</a></Button>
            ) : (<span>-</span>)}</div>
            <div><p className="font-semibold">Keterangan:</p><p>{selectedKegiatan.keterangan || '-'}</p></div>
          </div>
        )}
        <div className="mt-8">
          <p className="font-semibold mb-2">Video</p>
          <div className="bg-black aspect-video flex items-center justify-center">
            {selectedKegiatan?.youtube_link ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${selectedKegiatan.youtube_link.split('v=')[1]}`}
                title="YouTube video player"
                frameBorder="0"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="text-white">Tidak ada video</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const KegiatanBreadcrumb: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbPage>Laporan</BreadcrumbPage>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/laporan/kegiatan">Kegiatan</BreadcrumbLink>
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
        <SiteHeader breadcrumbs={KegiatanBreadcrumb} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 py-4 px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Data Laporan Kegiatan</h1>
            {activeView === 'table' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2 items-center">
                      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                        <DialogTrigger asChild>
                          <Button onClick={() => {
                            setEditingData(null);
                            form.reset({
                              namaKegiatan: '',
                              tglKegiatan: undefined as any,
                              linkYoutube: '',
                              keterangan: '',
                              fileUpload: undefined as any,
                              fotoKegiatan: undefined as any,
                            });
                            setIsSubmitting(false);
                          }}>+ Tambah Data</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-screen-lg max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Formulir Laporan Kegiatan</DialogTitle>
                          </DialogHeader>
                          {renderForm()}
                        </DialogContent>
                      </Dialog>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="data-per-halaman">Data Per Halaman</Label>
                        <Select value={String(itemsPerPage)} onValueChange={(v) => { const per = parseInt(v, 10); setItemsPerPage(per); loadRows(1, per); }}>
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
                        placeholder="Pencarian..."
                        className="w-[200px]"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                      />
                      <Button onClick={() => setCurrentPage(1)}>Cari</Button>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                      {error}
                    </div>
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
                      <KegiatanTable
                        data={filteredRows}
                        startIndex={(currentPage - 1) * itemsPerPage}
                        onDetailClick={handleDetailClick}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                      />
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                          {(() => {
                            const hasData = total > 0 && filteredRows.length > 0;
                            const start = hasData ? (currentPage - 1) * itemsPerPage + 1 : 0;
                            const end = hasData ? Math.min(start + filteredRows.length - 1, total) : 0;
                            return `Menampilkan ${start}-${end} dari ${total} data`;
                          })()}
                        </div>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage > 1) {
                                    const p = currentPage - 1;
                                    setCurrentPage(p);
                                    loadRows(p, itemsPerPage);
                                  }
                                }}
                                className={cn({ 'pointer-events-none opacity-50': currentPage === 1 })}
                              />
                            </PaginationItem>
                            {Array.from({ length: lastPage || 1 }).map((_, i) => {
                              const page = i + 1;
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    href="#"
                                    isActive={page === currentPage}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (page !== currentPage) {
                                        setCurrentPage(page);
                                        loadRows(page, itemsPerPage);
                                      }
                                    }}
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            })}
                            <PaginationItem>
                              <PaginationNext
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (currentPage < (lastPage || 1)) {
                                    const p = currentPage + 1;
                                    setCurrentPage(p);
                                    loadRows(p, itemsPerPage);
                                  }
                                }}
                                className={cn({ 'pointer-events-none opacity-50': currentPage >= (lastPage || 1) })}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    </>
                  )}
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Kegiatan?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
                          {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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