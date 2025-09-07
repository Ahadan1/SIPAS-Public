'use client';

import { useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { PlusCircle, Search, Edit, Eye, Trash2 } from 'lucide-react';

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

// Tiptap Editor Component
// This component should be created separately in `components/tiptap-editor.tsx`
// and should handle the editor logic and UI.
import { TiptapEditor } from '@/components/tiptap-editor';

type JenisNaskah = {
  id: number;
  nama_jenis: string;
  deskripsi: string; // HTML string
}

export default function JenisNaskahPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'detail'>('add');
  const [selectedItem, setSelectedItem] = useState<JenisNaskah | null>(null);
  const [formData, setFormData] = useState<{ nama_jenis: string; deskripsi: string }>({ nama_jenis: '', deskripsi: '' });

  const [rows, setRows] = useState<JenisNaskah[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const savingRef = useRef(false);

  const breadcrumbs: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbPage>Referensi</BreadcrumbPage>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbLink href="/referensi/jenis-naskah">Jenis Naskah</BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

  // Load rows from API
  async function loadRows(page = 1, perPage = itemsPerPage) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
      const res = await apiFetch(`/api/v1/jenis-naskah?${params.toString()}`, { auth: true });
      if (Array.isArray(res)) {
        const list = res as JenisNaskah[];
        const q = (searchQuery || '').toLowerCase().trim();
        const filtered = q
          ? list.filter(r => (r.nama_jenis || '').toLowerCase().includes(q) || (r.deskripsi || '').toLowerCase().includes(q))
          : list;
        const totalItems = filtered.length;
        const computedLastPage = Math.max(1, Math.ceil(totalItems / perPage));
        const safePage = Math.min(Math.max(1, page), computedLastPage);
        const start = (safePage - 1) * perPage;
        const pageRows = filtered.slice(start, start + perPage);
        setRows(pageRows);
        setCurrentPage(safePage);
        setItemsPerPage(perPage);
        setLastPage(computedLastPage);
        setTotalItems(totalItems);
      } else if (res && typeof res === 'object') {
        setRows((res.data || []) as JenisNaskah[]);
        setCurrentPage(Number(res.current_page) || page);
        setItemsPerPage(Number(res.per_page) || perPage);
        setTotalItems(Number(res.total) || (res.data?.length ?? 0));
        setLastPage(Number(res.last_page) || 1);
      } else {
        setRows([]);
        setTotalItems(0);
        setLastPage(1);
      }
    } catch (e: any) {
      toast.error(e.message || 'Gagal memuat data');
      setRows([]);
      setTotalItems(0);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRows(currentPage, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  // Reload data when search changes so pagination count/page adjust accordingly
  useEffect(() => {
    setCurrentPage(1);
    loadRows(1, itemsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Client-side filter on current page rows for visible columns
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.nama_jenis?.toLowerCase().includes(q) ||
      (r.deskripsi || '').toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  const totalPages = lastPage || Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Dialog handlers
  const openDialog = (mode: 'add' | 'edit' | 'detail', item?: JenisNaskah) => {
    setDialogMode(mode);
    setSelectedItem(item || null);
    if (mode === 'add') {
      setFormData({ nama_jenis: '', deskripsi: '' });
    } else if (item) {
      setFormData({ nama_jenis: item.nama_jenis || '', deskripsi: item.deskripsi || '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nama_jenis) { toast.error('Nama Jenis wajib diisi'); return; }
    if (savingRef.current) return;
    try {
      savingRef.current = true;
      setSaving(true);
      await apiFetch('/api/v1/jenis-naskah', { method: 'POST', auth: true, body: formData });
      toast.success('Berhasil menambahkan data');
      setIsDialogOpen(false);
      setFormData({ nama_jenis: '', deskripsi: '' });
      loadRows(currentPage, itemsPerPage);
    } catch (e: any) {
      toast.error(e.message || 'Gagal menyimpan data');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    if (!formData.nama_jenis) { toast.error('Nama Jenis wajib diisi'); return; }
    if (savingRef.current) return;
    try {
      savingRef.current = true;
      setSaving(true);
      await apiFetch(`/api/v1/jenis-naskah/${selectedItem.id}`, { method: 'PUT', auth: true, body: formData });
      toast.success('Berhasil memperbarui data');
      setIsDialogOpen(false);
      setFormData({ nama_jenis: '', deskripsi: '' });
      setSelectedItem(null);
      loadRows(currentPage, itemsPerPage);
    } catch (e: any) {
      toast.error(e.message || 'Gagal memperbarui data');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (deleting) return;
    try {
      setDeleting(true);
      await apiFetch(`/api/v1/jenis-naskah/${id}`, { method: 'DELETE', auth: true });
      toast.success('Berhasil menghapus data');
      loadRows(currentPage, itemsPerPage);
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  const renderDialogContent = () => {
    const isEditing = dialogMode === 'edit';
    const isViewing = dialogMode === 'detail';
    const dialogTitle = isViewing ? 'Detail Ref Jenis Naskah' : 'Form Ref Jenis Naskah';

    return (
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {isViewing ? "Berikut detail data referensi jenis naskah." : "Lengkapi form untuk menambahkan atau mengubah data."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="nama_jenis" className="text-right">
              Nama Jenis
            </Label>
            {isViewing ? (
              <p className="col-span-4">{formData.nama_jenis}</p>
            ) : (
              <Input
                id="nama_jenis"
                value={formData.nama_jenis}
                onChange={(e) => setFormData({ ...formData, nama_jenis: e.target.value })}
                className="col-span-4"
                disabled={saving}
              />
            )}
          </div>
          <div className="grid grid-cols-5 items-start gap-4">
            <Label htmlFor="deskripsi" className="text-right">
              Deskripsi
            </Label>
            <div className="col-span-4">
              <TiptapEditor
                content={formData.deskripsi}
                onUpdate={(value) => setFormData({ ...formData, deskripsi: value })}
                isEditable={!isViewing}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          {isViewing ? (
            <Button onClick={() => setIsDialogOpen(false)} variant="secondary">
              Kembali
            </Button>
          ) : (
            <>
              <Button type="button" variant="secondary" onClick={() => !saving && setIsDialogOpen(false)} disabled={saving}>
                {saving ? 'Mohon tunggu...' : 'Cancel'}
              </Button>
              <Button type="submit" onClick={isEditing ? handleUpdate : handleSave} disabled={saving}>
                {isEditing ? (saving ? 'Menyimpan...' : 'Update') : (saving ? 'Menyimpan...' : 'Save')}
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
            <h1 className="text-2xl font-bold">Referensi Jenis Naskah</h1>
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
                  <Select value={itemsPerPage.toString()} onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}>
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
                    onChange={(e) => { setSearchQuery(e.target.value); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); loadRows(1, itemsPerPage); } }}
                  />
                  <Button variant="outline" onClick={() => { setCurrentPage(1); loadRows(1, itemsPerPage); }} className="px-4">
                    <Search className="mr-2 h-4 w-4" /> Cari
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Nama Jenis</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="w-[150px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: Math.min(itemsPerPage, 10) }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-6" /></TableCell>
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
                          <TableCell>{startIndex + index + 1}</TableCell>
                          <TableCell>{row.nama_jenis}</TableCell>
                          <TableCell className="max-w-xs truncate" dangerouslySetInnerHTML={{ __html: row.deskripsi || '' }} />
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => openDialog('detail', row)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openDialog('edit', row)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(row.id)} disabled={deleting}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          Tidak ada data yang cocok dengan pencarian Anda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Menampilkan {rows.length ? startIndex + 1 : 0} - {Math.min(endIndex, startIndex + filteredRows.length)} dari {totalItems} data
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.max(prev - 1, 1)); }} />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(prev => Math.min(prev + 1, totalPages)); }} />
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
      </SidebarInset>
    </SidebarProvider>
  );
}