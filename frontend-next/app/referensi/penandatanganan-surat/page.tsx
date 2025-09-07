'use client';

import { useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { PlusCircle, Search, Edit, Trash2, Image } from 'lucide-react';

// Sidebar and Navbar components
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

// Breadcrumb components
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
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

// --- MOCK DATA FOR PENANDATANGANAN ---
type Penandatanganan = {
  id: number;
  nama: string;
  kode: string;
  file_ttd?: string | null;
}

export default function PenandatangananPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedItem, setSelectedItem] = useState<Penandatanganan | null>(null);
  const [formData, setFormData] = useState<{ nama: string; kode: string; fileTtd: File | null }>({ nama: '', kode: '', fileTtd: null });
  const [rows, setRows] = useState<Penandatanganan[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Penandatanganan | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const savingRef = useRef(false);

  const breadcrumbs: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbPage>Referensi</BreadcrumbPage>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/referensi/penandatanganan-surat">Penandatanganan Surat</BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

  // Load data from API
  const loadRows = async (page = currentPage, perPage = itemsPerPage, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      if (search) params.set('search', search);
      const res = await apiFetch<any>(`/api/v1/ref-penandatanganan?${params.toString()}`, { auth: true });
      if (Array.isArray(res)) {
        const list: Penandatanganan[] = res as Penandatanganan[];
        const filtered = (search
          ? list.filter((r) => (
              (r.nama || '').toLowerCase().includes(search.toLowerCase()) ||
              (r.kode || '').toLowerCase().includes(search.toLowerCase())
            ))
          : list
        ).slice().sort((a, b) => (a.nama || '').localeCompare(b.nama || '', 'id', { sensitivity: 'base' }));
        const total = filtered.length;
        const computedLastPage = Math.max(1, Math.ceil(total / perPage));
        const safePage = Math.min(Math.max(1, page), computedLastPage);
        const start = (safePage - 1) * perPage;
        const end = start + perPage;
        setRows(filtered.slice(start, end));
        setTotalItems(total);
        setLastPage(computedLastPage);
        setCurrentPage(safePage);
      } else {
        const data: Penandatanganan[] = res?.data ?? [];
        setRows(data);
        setTotalItems(res?.total ?? data.length ?? 0);
        setLastPage(res?.last_page ?? 1);
        setCurrentPage(res?.current_page ?? page ?? 1);
      }
    } catch (e: any) {
      toast.error(e.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows(1, itemsPerPage, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRows = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.nama || '').toLowerCase().includes(q) ||
      (r.kode || '').toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  // Dialog handlers
  const openDialog = (mode: 'add' | 'edit', item?: Penandatanganan) => {
    setDialogMode(mode);
    setSelectedItem(item || null);
    if (mode === 'add') {
      setFormData({ nama: '', kode: '', fileTtd: null });
    } else if (item) {
      setFormData({ nama: item.nama, kode: item.kode, fileTtd: null });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nama || !formData.kode) { toast.error('Nama dan Kode wajib diisi'); return; }
    if (savingRef.current) return;
    try {
      savingRef.current = true;
      setSaving(true);
      const body: FormData | Record<string, any> = new FormData();
      (body as FormData).append('nama', formData.nama);
      (body as FormData).append('kode', formData.kode);
      if (formData.fileTtd) (body as FormData).append('file_ttd', formData.fileTtd);
      await apiFetch('/api/v1/ref-penandatanganan', { method: 'POST', auth: true, body });
      toast.success('Berhasil menambahkan data');
      setIsDialogOpen(false);
      setFormData({ nama: '', kode: '', fileTtd: null });
      loadRows(currentPage, itemsPerPage, searchQuery);
    } catch (e: any) {
      toast.error(e.message || 'Gagal menyimpan data');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    if (!formData.nama || !formData.kode) { toast.error('Nama dan Kode wajib diisi'); return; }
    if (savingRef.current) return;
    try {
      savingRef.current = true;
      setSaving(true);
      const body: FormData | Record<string, any> = new FormData();
      (body as FormData).append('nama', formData.nama);
      (body as FormData).append('kode', formData.kode);
      if (formData.fileTtd) (body as FormData).append('file_ttd', formData.fileTtd);
      (body as any).append('_method', 'PUT'); // in case backend expects method spoofing when using multipart
      await apiFetch(`/api/v1/ref-penandatanganan/${selectedItem.id}`, { method: 'POST', auth: true, body });
      toast.success('Berhasil memperbarui data');
      setIsDialogOpen(false);
      setFormData({ nama: '', kode: '', fileTtd: null });
      setSelectedItem(null);
      loadRows(currentPage, itemsPerPage, searchQuery);
    } catch (e: any) {
      toast.error(e.message || 'Gagal memperbarui data');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);
      await apiFetch(`/api/v1/ref-penandatanganan/${id}`, { method: 'DELETE', auth: true, parseJson: false });
      toast.success('Berhasil menghapus data');
      loadRows(currentPage, itemsPerPage, searchQuery);
      setIsDeleteOpen(false);
      setRowToDelete(null);
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, fileTtd: e.target.files[0] });
    }
  };

  const renderDialogContent = () => {
    const isEditing = dialogMode === 'edit';
    const dialogTitle = isEditing ? 'Form Ref Penandatanganan' : 'Form Ref Penandatanganan';

    return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Lengkapi form untuk menambahkan atau mengubah data penandatanganan surat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nama" className="text-right">
              Nama
            </Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              disabled={saving}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kode" className="text-right">
              Kode
            </Label>
            <Input
              id="kode"
              value={formData.kode}
              onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
              disabled={saving}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fileTtd" className="text-right">
              File TTD
            </Label>
            <div className="col-span-3">
              <Input
                id="fileTtd"
                type="file"
                onChange={handleFileChange}
                disabled={saving}
              />
              {formData.fileTtd && <p className="text-sm mt-2 text-muted-foreground">{formData.fileTtd.name}</p>}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => !saving && setIsDialogOpen(false)} disabled={saving}>
            {saving ? 'Mohon tunggu...' : 'Cancel'}
          </Button>
          <Button type="submit" onClick={isEditing ? handleUpdate : handleSave} disabled={saving}>
            {isEditing ? (saving ? 'Menyimpan...' : 'Update') : (saving ? 'Menyimpan...' : 'Save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    );
  };

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
          <div className="flex flex-row items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Data Ref Penandatanganan</h1>
            <Button onClick={() => openDialog('add')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Data Per Halaman:</span>
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => { const per = Number(value); setItemsPerPage(per); setCurrentPage(1); loadRows(1, per, searchQuery); }}>
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
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  />
                  <Button variant="outline" onClick={() => setCurrentPage(1)} className="px-4">
                    <Search className="mr-2 h-4 w-4" /> Cari
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>File TTD</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: itemsPerPage }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-5" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredRows.length > 0 ? (
                      filteredRows.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>{row.nama}</TableCell>
                          <TableCell>{row.kode}</TableCell>
                          <TableCell>
                            {row.file_ttd ? (
                              <Image className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openDialog('edit', row)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => { setRowToDelete(row); setIsDeleteOpen(true); }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Tidak ada data yang cocok dengan pencarian Anda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Menampilkan {filteredRows.length > 0 ? ((currentPage - 1) * itemsPerPage + 1) : 0}
                  {' '}hingga{' '}
                  {Math.min((currentPage - 1) * itemsPerPage + filteredRows.length, totalItems)} dari {totalItems} data
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1 && !loading) loadRows(currentPage - 1, itemsPerPage, searchQuery); }} className={currentPage <= 1 || loading ? 'pointer-events-none opacity-50' : ''} aria-disabled={currentPage <= 1 || loading} />
                    </PaginationItem>
                    {lastPage > 0 && Array.from({ length: lastPage }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); if (!loading && i + 1 !== currentPage) loadRows(i + 1, itemsPerPage, searchQuery); }}>
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < lastPage && !loading) loadRows(currentPage + 1, itemsPerPage, searchQuery); }} className={currentPage >= lastPage || loading ? 'pointer-events-none opacity-50' : ''} aria-disabled={currentPage >= lastPage || loading} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          {renderDialogContent()}
        </Dialog>
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Data</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus penandatanganan{rowToDelete ? ` "${rowToDelete.nama}"` : ''}? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={() => rowToDelete && handleDelete(rowToDelete.id)} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
                {deleting ? 'Menghapus...' : 'Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}