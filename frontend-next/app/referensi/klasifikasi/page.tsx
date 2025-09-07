'use client';

import { useEffect, useRef, useState, ReactNode, useMemo } from 'react';
import { PlusCircle, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';

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

type Klasifikasi = {
  id: number;
  kode: string;
  nama: string;
  uraian: string;
};

export default function KlasifikasiPage() {
  const [rows, setRows] = useState<Klasifikasi[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'detail'>('add');
  const [selectedItem, setSelectedItem] = useState<Klasifikasi | null>(null);
  const [formData, setFormData] = useState<{ kode: string; nama: string; uraian: string }>({ kode: '', nama: '', uraian: '' });
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Klasifikasi | null>(null);
  const [deleting, setDeleting] = useState(false);

  const breadcrumbs: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbPage>Referensi</BreadcrumbPage>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/referensi/klasifikasi">Klasifikasi</BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

  // Data loader
  const loadRows = async (page = currentPage, perPage = itemsPerPage, search = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('per_page', String(perPage));
      if (search) params.set('search', search);
      const res = await apiFetch<any>(`/api/v1/klasifikasi?${params.toString()}`, { auth: true });
      // If backend returns a plain array (no pagination), do client-side filter + paginate
      if (Array.isArray(res)) {
        const list: Klasifikasi[] = (res as any[]).map((r) => ({
          id: r.id,
          kode: r.kode_klasifikasi ?? '',
          nama: r.nama_klasifikasi ?? '',
          uraian: r.deskripsi ?? '',
        }));
        const filtered = search
          ? list.filter((r) => {
              const q = search.toLowerCase();
              return (
                (r.kode?.toLowerCase() || '').includes(q) ||
                (r.nama?.toLowerCase() || '').includes(q) ||
                (r.uraian?.toLowerCase() || '').includes(q)
              );
            })
          : list;
        const totalItems = filtered.length;
        const start = (page - 1) * perPage;
        const pageRows = filtered.slice(start, start + perPage);
        setRows(pageRows);
        setCurrentPage(page);
        setItemsPerPage(perPage);
        setLastPage(Math.max(1, Math.ceil(totalItems / perPage)));
        setTotal(totalItems);
      } else {
        // Assume Laravel paginator-like structure
        const data: Klasifikasi[] = (res?.data ?? []).map((r: any) => ({
          id: r.id,
          kode: r.kode_klasifikasi ?? '',
          nama: r.nama_klasifikasi ?? '',
          uraian: r.deskripsi ?? '',
        }));
        setRows(data);
        setCurrentPage(res?.current_page ?? page);
        setItemsPerPage(res?.per_page ?? perPage);
        setLastPage(res?.last_page ?? 1);
        setTotal(res?.total ?? data.length);
      }
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

  // Client-side filter over current page rows (match laporan/* behavior)
  const filteredRows = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) =>
      (r.kode || '').toLowerCase().includes(q) ||
      (r.nama || '').toLowerCase().includes(q) ||
      (r.uraian || '').toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  // Dialog handlers
  const openDialog = (mode: 'add' | 'edit' | 'detail', item?: Klasifikasi) => {
    setDialogMode(mode);
    setSelectedItem(item || null);
    if (mode === 'add') {
      setFormData({ kode: '', nama: '', uraian: '' });
    } else if (item) {
      setFormData({ kode: item.kode || '', nama: item.nama, uraian: item.uraian });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (savingRef.current) return;
    if (!formData.nama || !formData.kode) { toast.error('Nama dan Kode wajib diisi'); return; }
    try {
      setSaving(true);
      savingRef.current = true;
      if (dialogMode === 'add') {
        await apiFetch('/api/v1/klasifikasi', {
          method: 'POST',
          auth: true,
          body: {
            kode_klasifikasi: formData.kode,
            nama_klasifikasi: formData.nama,
            deskripsi: formData.uraian,
          },
        });
        toast.success('Berhasil menambahkan data');
      } else if (dialogMode === 'edit' && selectedItem) {
        await apiFetch(`/api/v1/klasifikasi/${selectedItem.id}`, {
          method: 'PUT',
          auth: true,
          body: {
            kode_klasifikasi: formData.kode,
            nama_klasifikasi: formData.nama,
            deskripsi: formData.uraian,
          },
        });
        toast.success('Berhasil memperbarui data');
      }
      setIsDialogOpen(false);
      setFormData({ kode: '', nama: '', uraian: '' });
      setSelectedItem(null);
      loadRows(currentPage, itemsPerPage, searchQuery);
    } catch (e: any) {
      toast.error(e.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeleting(true);
      await apiFetch(`/api/v1/klasifikasi/${id}`, { method: 'DELETE', auth: true, parseJson: false });
      toast.success('Berhasil menghapus data');
      // reload current page (or shift to previous if last item deleted)
      loadRows(currentPage, itemsPerPage, searchQuery);
      setIsDeleteOpen(false);
      setRowToDelete(null);
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  const renderDialogContent = () => {
    const isEditing = dialogMode === 'edit';
    const isViewing = dialogMode === 'detail';
    const dialogTitle = isEditing ? 'Form Ref Klasifikasi' : isViewing ? 'Detail Ref Klasifikasi' : 'Form Ref Klasifikasi';

    return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {isViewing ? "Berikut detail data referensi klasifikasi." : "Lengkapi form untuk menambahkan atau mengubah data."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="kode" className="text-right">
              Kode
            </Label>
            {isViewing ? (
              <p className="col-span-3">{formData.kode}</p>
            ) : (
              <Input
                id="kode"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                className="col-span-3"
              />
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nama" className="text-right">
              Nama
            </Label>
            {isViewing ? (
              <p className="col-span-3">{formData.nama}</p>
            ) : (
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                className="col-span-3"
              />
            )}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="uraian" className="text-right">
              Uraian
            </Label>
            {isViewing ? (
              <p className="col-span-3">{formData.uraian}</p>
            ) : (
              <Input
                id="uraian"
                value={formData.uraian}
                onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
                className="col-span-3"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          {isViewing ? (
            <Button onClick={() => setIsDialogOpen(false)} variant="secondary">
              Kembali
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : isEditing ? 'Update' : 'Save'}
              </Button>
            </>
          )}
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
            <h1 className="text-2xl font-bold">Data Ref Klasifikasi</h1>
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
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => { const per = Number(value); setItemsPerPage(per); setCurrentPage(1); loadRows(1, per, searchQuery); }} disabled={loading}>
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
              {/* Removed skeletons for top controls to prevent duplicate controls during loading */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Uraian</TableHead>
                      <TableHead className="w-[150px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`}>
                          <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : filteredRows.length > 0 ? (
                      filteredRows.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>{row.kode}</TableCell>
                          <TableCell>{row.nama}</TableCell>
                          <TableCell>{row.uraian}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => openDialog('detail', row)} disabled={loading}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openDialog('edit', row)} disabled={loading}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => { setRowToDelete(row); setIsDeleteOpen(true); }}
                                disabled={loading}
                              >
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
                        onClick={(e) => { e.preventDefault(); if (currentPage > 1 && !loading) loadRows(currentPage - 1, itemsPerPage, searchQuery); }}
                        className={currentPage <= 1 || loading ? 'pointer-events-none opacity-50' : ''}
                        aria-disabled={currentPage <= 1 || loading}
                      />
                    </PaginationItem>
                    {lastPage > 0 && Array.from({ length: lastPage }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); if (!loading && i + 1 !== currentPage) loadRows(i + 1, itemsPerPage, searchQuery); }}>
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => { e.preventDefault(); if (currentPage < lastPage && !loading) loadRows(currentPage + 1, itemsPerPage, searchQuery); }}
                        className={currentPage >= lastPage || loading ? 'pointer-events-none opacity-50' : ''}
                        aria-disabled={currentPage >= lastPage || loading}
                      />
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
                Apakah Anda yakin ingin menghapus ref klasifikasi
                {rowToDelete ? ` "${rowToDelete.kode} - ${rowToDelete.nama}"` : ''}? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                Batal
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => rowToDelete && handleDelete(rowToDelete.id)}
                disabled={deleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}