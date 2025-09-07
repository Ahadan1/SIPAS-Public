'use client';

import { useEffect, useMemo, useRef, useState, ReactNode } from 'react';
import { PlusCircle, Search, Edit, Download, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
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
  BreadcrumbList
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from "@/lib/utils";
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

type SuratRekap = {
  id: number;
  tahun: string | number;
  kode_uk: string;
  tanggal?: string | null;
  file_upload?: string | null;
}

export default function SuratRekapPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SuratRekap | null>(null);
  const [formData, setFormData] = useState({
    tahun: null as Date | null,
    unitKerja: '',
    file: null as File | null
  });
  const [rows, setRows] = useState<SuratRekap[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const savingRef = useRef(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<SuratRekap | null>(null);

  const breadcrumbs: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/rekap-surat">Rekap Surat</BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

  // Load from backend
  const loadRows = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<any>('/api/v1/surat-rekap', { auth: true });
      if (Array.isArray(res)) {
        setRows(res as SuratRekap[]);
      } else {
        setRows((res?.data ?? []) as SuratRekap[]);
      }
    } catch (e: any) {
      toast.error(e.message || 'Gagal memuat data');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client-side filter and pagination
  const filteredRows = useMemo(() => {
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) =>
      String(r.tahun ?? '').toLowerCase().includes(q) ||
      (r.kode_uk || '').toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleRows = filteredRows.slice(startIndex, endIndex);

  // Dialog handlers
  const openAddDialog = () => {
    setIsAddMode(true);
    setSelectedItem(null);
    setFormData({
      unitKerja: '',
      tahun: null,
      file: null
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: SuratRekap) => {
    setIsAddMode(false);
    setSelectedItem(item);
    setFormData({
      unitKerja: item.kode_uk,
      tahun: new Date(Number(item.tahun) || new Date().getFullYear(), 0, 1),
      file: null
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.tahun || !formData.unitKerja) {
      toast.error('Tahun dan Unit Kerja wajib diisi');
      return;
    }
    if (savingRef.current) return;
    try {
      savingRef.current = true;
      setSaving(true);
      const body = new FormData();
      body.append('tahun', String(formData.tahun.getFullYear()));
      body.append('kode_uk', formData.unitKerja);
      if (formData.file) body.append('file_upload', formData.file);
      await apiFetch('/api/v1/surat-rekap', { method: 'POST', auth: true, body });
      toast.success('Berhasil menambahkan data');
      setIsDialogOpen(false);
      setFormData({ tahun: null, unitKerja: '', file: null });
      loadRows();
    } catch (e: any) {
      toast.error(e.message || 'Gagal menyimpan data');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    if (!formData.tahun || !formData.unitKerja) {
      toast.error('Tahun dan Unit Kerja wajib diisi');
      return;
    }
    if (savingRef.current) return;
    try {
      savingRef.current = true;
      setSaving(true);
      const body = new FormData();
      body.append('tahun', String(formData.tahun.getFullYear()));
      body.append('kode_uk', formData.unitKerja);
      if (formData.file) body.append('file_upload', formData.file);
      (body as any).append('_method', 'PUT');
      await apiFetch(`/api/v1/surat-rekap/${selectedItem.id}`, { method: 'POST', auth: true, body });
      toast.success('Berhasil memperbarui data');
      setIsDialogOpen(false);
      setFormData({ tahun: null, unitKerja: '', file: null });
      setSelectedItem(null);
      loadRows();
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
      await apiFetch(`/api/v1/surat-rekap/${id}`, { method: 'DELETE', auth: true, parseJson: false });
      toast.success('Berhasil menghapus data');
      loadRows();
    } catch (e: any) {
      toast.error(e.message || 'Gagal menghapus data');
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = (item: SuratRekap) => {
    if (!item.file_upload) {
      toast.error('File tidak tersedia');
      return;
    }
    // Attempt to open the public storage path. Adjust if your deployment uses a different base URL.
    const url = `/storage/surat_rekap/${item.file_upload}`;
    window.open(url, '_blank');
  };

  const renderDialogContent = () => {
    const dialogTitle = isAddMode ? 'Form Tambah Data' : 'Form Edit Data';

    return (
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Lengkapi form untuk {isAddMode ? 'menambahkan' : 'mengubah'} data rekap surat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tahun" className="text-right">Tahun</Label>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal col-span-3",
                    !formData.tahun && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.tahun ? format(formData.tahun, "yyyy") : <span>Pilih Tahun</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  captionLayout="dropdown-years"
                  selected={formData.tahun || undefined}
                  onSelect={(date) => {
                    if (date) {
                      setFormData({ ...formData, tahun: date });
                      setPopoverOpen(false); // Close popover immediately on selection
                    }
                  }}
                  fromYear={2000}
                  toYear={new Date().getFullYear()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitKerja" className="text-right">Unit Kerja</Label>
            <Select value={formData.unitKerja} onValueChange={(value) => setFormData({ ...formData, unitKerja: value })}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih Unit Kerja" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BAS">BAS</SelectItem>
                <SelectItem value="SIL">SIL</SelectItem>
                <SelectItem value="SKSG">SKSG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">Upload File</Label>
            <Input
              id="file"
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={isAddMode ? handleSave : handleUpdate}>
            {isAddMode ? 'Save' : 'Update'}
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
            <h1 className="text-2xl font-bold">Data Rekap Surat</h1>
            <Button onClick={openAddDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Data Per Halaman:</span>
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => { setItemsPerPage(Number(value)); setCurrentPage(1); }}
                  >
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
                      <TableHead>Tahun</TableHead>
                      <TableHead>Unit Kerja</TableHead>
                      <TableHead className="w-[150px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: Math.min(itemsPerPage, 10) }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                              <Skeleton className="h-8 w-8" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : visibleRows.length > 0 ? (
                      visibleRows.map((row, index) => (
                        <TableRow key={row.id}>
                          <TableCell>{startIndex + index + 1}</TableCell>
                          <TableCell>{row.tahun}</TableCell>
                          <TableCell>{row.kode_uk}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleDownload(row)} disabled={!row.file_upload}>
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(row)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => { setRowToDelete(row); setIsDeleteOpen(true); }}
                                disabled={deleting}
                              >
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
                  Menampilkan {rows.length ? startIndex + 1 : 0} - {Math.min(endIndex, startIndex + visibleRows.length)} dari {filteredRows.length} data
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
        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus data?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Data rekap surat akan dihapus permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => { if (rowToDelete) handleDelete(rowToDelete.id); }}
                disabled={deleting}
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