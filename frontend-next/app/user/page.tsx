'use client';

import { useEffect, useState, ReactNode, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';

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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';
import {
  Card,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { listUsers, listUsersPaged, BackendUser } from '@/lib/users';
import type { UsersPage as UsersPageResp } from '@/lib/users';
import { listJabatan, Jabatan } from '@/lib/jabatan';
import { fetchUnitKerja, type UnitKerjaItem } from '@/lib/ref';
import { fetchMe, type ApiUser } from '@/lib/user';
import { apiFetch } from '@/lib/api';

// Data will be loaded from backend
// Jabatan filter options will be derived dynamically from data
const levelOptions = ['Super Admin', 'Pimpinan', 'Kaprodi', 'Koordinator', 'Drafter'];

// --- FORM SCHEMA ---
const formSchema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  email: z.string().email({ message: 'Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  nama: z.string().min(1, { message: 'Nama is required' }),
  unitKerja: z.string().min(1, { message: 'Unit Kerja is required' }),
  jabatan: z.string().min(1, { message: 'Jabatan is required' }),
  level: z.string().min(1, { message: 'Level is required' }),
});

type FormValues = z.infer<typeof formSchema>;

// --- USER FORM COMPONENT ---
function UserForm({ defaultValues, onSubmit, isEditing, onCancel, jabatanList, unitKerjaOptions, defaultUnitKerja, submitting }: { defaultValues: any, onSubmit: any, isEditing: boolean, onCancel: any, jabatanList: Jabatan[], unitKerjaOptions: UnitKerjaItem[], defaultUnitKerja?: string, submitting?: boolean }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      username: '',
      email: '',
      password: '',
      nama: '',
      unitKerja: '',
      jabatan: '', // will hold jabatan_id string
      level: '',
    },
  });

  // Apply default Unit Kerja for create when empty
  useEffect(() => {
    if (!isEditing) {
      const v = form.getValues('unitKerja');
      if ((!v || v === '') && defaultUnitKerja) {
        form.setValue('unitKerja', defaultUnitKerja);
      }
    }
  }, [isEditing, defaultUnitKerja]);

  const handleSubmit = (data: FormValues) => {
    if (submitting) return; // prevent double submit
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="username" render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="nama" render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl><Input {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="unitKerja" render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Kerja</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="~ ~ PILIH ~ ~" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {unitKerjaOptions.map(opt => (
                    <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="jabatan" render={({ field }) => (
            <FormItem>
              <FormLabel>Jabatan</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="~ ~ PILIH ~ ~" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jabatanList.map(option => (
                    <SelectItem key={option.id} value={String(option.id)}>{option.nama_jabatan}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="level" render={({ field }) => (
            <FormItem>
              <FormLabel>Level</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="~ ~ PILIH ~ ~" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {levelOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button type="submit" disabled={!!submitting}>
            {submitting ? (
              <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {isEditing ? 'Updating...' : 'Saving...'}</span>
            ) : (isEditing ? 'Update' : 'Save')}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={!!submitting}>Cancel</Button>
        </div>
      </form>
    </Form>
  );
}

// --- CHANGE PASSWORD DIALOG COMPONENT ---
const changePasswordSchema = z.object({
  password: z.string().min(8, { message: 'Minimal 8 karakter' }),
  password_confirmation: z.string().min(8, { message: 'Minimal 8 karakter' }),
}).refine((data) => data.password === data.password_confirmation, {
  path: ['password_confirmation'],
  message: 'Konfirmasi password tidak sama',
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

function ChangePasswordDialog({ open, onOpenChange, userId, username, onSuccess }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | null;
  username?: string;
  onSuccess: () => void;
}) {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  });

  const submitting = form.formState.isSubmitting;

  const submit = async (values: ChangePasswordValues) => {
    if (!userId) return;
    try {
      await apiFetch(`/api/v1/users/${userId}/password`, { method: 'PATCH', body: values, auth: true, parseJson: false });
      toast.success('Password berhasil diubah');
      onOpenChange(false);
      form.reset({ password: '', password_confirmation: '' });
      onSuccess();
    } catch (e: any) {
      toast.error(e?.message || 'Gagal mengubah password');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) form.reset({ password: '', password_confirmation: '' }); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Password {username ? `(${username})` : ''}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password Baru</FormLabel>
                <FormControl><Input type="password" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password_confirmation" render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi Password</FormLabel>
                <FormControl><Input type="password" {...field} value={field.value ?? ''} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={submitting}>Simpan</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function UsersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [jabatanList, setJabatanList] = useState<Jabatan[]>([]);
  const [unitKerjaOptions, setUnitKerjaOptions] = useState<UnitKerjaItem[]>([]);
  const [meKodeUk, setMeKodeUk] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [pwdDialogOpen, setPwdDialogOpen] = useState(false);
  const [pwdUser, setPwdUser] = useState<{ id: number, username?: string } | null>(null);
  const [meta, setMeta] = useState<any>(null);
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State untuk filter
  const [unitKerjaFilter, setUnitKerjaFilter] = useState('Semua');
  const [jabatanFilter, setJabatanFilter] = useState('Semua');
  const [levelFilter, setLevelFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Build Jabatan options from loaded users; fallback to jabatanList if users empty
  const jabatanFilterOptions = useMemo(() => {
    const names = new Set<string>();
    users.forEach(u => { if (u && (u as any).jabatan) names.add((u as any).jabatan as string); });
    // Always include master jabatan list as well
    jabatanList.forEach(j => names.add(j.nama_jabatan));
    return Array.from(names).sort();
  }, [users, jabatanList]);

  useEffect(() => {
    let mounted = true;
    async function loadUsersFirstPage() {
      try {
        setLoading(true);
        const res: UsersPageResp = await listUsersPaged({ page: currentPage, per_page: itemsPerPage, search: searchQuery || undefined });
        if (!mounted) return;
        setUsers(res.data || []);
        setMeta((res as any).meta || null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load users', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    async function loadJabatan() {
      try {
        const j = await listJabatan();
        if (!mounted) return;
        setJabatanList(j);
      } catch (e) {
        // ignore
      }
    }
    async function loadUnitKerja() {
      try {
        const items = await fetchUnitKerja();
        if (!mounted) return;
        setUnitKerjaOptions(items);
      } catch {
        // ignore
      }
    }
    loadUsersFirstPage();
    loadJabatan();
    loadUnitKerja();
    // Load current user for default Unit Kerja
    (async () => {
      try {
        const me = await fetchMe();
        const kode = (me as any)?.kode_uk || (me as any)?.unit_kerja || '';
        if (mounted) setMeKodeUk(String(kode || ''));
      } catch { /* ignore */ }
    })();
    return () => { mounted = false };
  }, [itemsPerPage, searchQuery, currentPage]);


  const handleAddSubmit = async (data: FormValues) => {
    if (submittingAdd) return;
    try {
      setSubmittingAdd(true);
      const payload = {
        nama: data.nama,
        username: data.username,
        email: data.email,
        password: data.password,
        password_confirmation: data.password, // same as password for now
        jabatan_id: Number(data.jabatan),
        kode_uk: data.unitKerja, // map Unit Kerja code to backend column
        level: data.level,
      };
      await apiFetch('/api/v1/users', { method: 'POST', body: payload, auth: true });
      // Refresh current page
      const res: UsersPageResp = await listUsersPaged({ page: currentPage, per_page: itemsPerPage, search: searchQuery || undefined });
      setUsers(res.data || []);
      setMeta((res as any).meta || null);
      // keep currentPage
      setIsAddDialogOpen(false);
      toast.success('User created');
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to add user', e);
      toast.error(e?.message || 'Failed to add user');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const handleEditClick = (user: any) => {
    // Map resource fields to form fields
    const inferredJabatanId = (() => {
      if (!user?.jabatan) return '';
      const match = jabatanList.find(j => j.nama_jabatan === user.jabatan);
      return match ? String(match.id) : '';
    })();

    const defaults = {
      username: user.username ?? '',
      email: user.email ?? '',
      password: '',
      nama: user.name ?? user.nama ?? '',
      unitKerja: user.kode_uk ?? user.unit_kerja ?? '',
      jabatan: inferredJabatanId,
      level: user.level ?? '',
    };
    setSelectedUserId(user.id);
    setEditingUser(defaults);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (data: FormValues) => {
    if (!selectedUserId) return;
    if (submittingEdit) return;
    try {
      setSubmittingEdit(true);
      const payload: any = {
        nama: data.nama,
        username: data.username,
        email: data.email,
        jabatan_id: data.jabatan ? Number(data.jabatan) : undefined,
        kode_uk: data.unitKerja || undefined,
        level: data.level,
      };
      if (data.password && data.password.trim().length > 0) {
        payload.password = data.password;
        payload.password_confirmation = data.password;
      }
      await apiFetch(`/api/v1/users/${selectedUserId}`, { method: 'PUT', body: payload, auth: true });
      // Refresh current page
      const res: UsersPageResp = await listUsersPaged({ page: currentPage, per_page: itemsPerPage, search: searchQuery || undefined });
      setUsers(res.data || []);
      setMeta((res as any).meta || null);
      // keep currentPage
      setIsEditDialogOpen(false);
      setEditingUser(null);
      setSelectedUserId(null);
      toast.success('User updated');
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to update user', e);
      toast.error(e?.message || 'Failed to update user');
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiFetch(`/api/v1/users/${id}`, { method: 'DELETE', auth: true, parseJson: false });
      // Refresh current page after delete
      const res: UsersPageResp = await listUsersPaged({ page: currentPage, per_page: itemsPerPage, search: searchQuery || undefined });
      setUsers(res.data || []);
      setMeta((res as any).meta || null);
      // keep currentPage
      toast.success('User deleted');
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete user', e);
      toast.error(e?.message || 'Failed to delete user');
    }
  };

  const openChangePassword = (user: any) => {
    setPwdUser({ id: user.id, username: user.username });
    setPwdDialogOpen(true);
  };

  // Logika filter
  const filteredUsers = users.filter((user: any) => {
    const uk = user.unit_kerja || user.kode_uk || '';
    const matchesUnitKerja = unitKerjaFilter === 'Semua' || uk === unitKerjaFilter;
    const matchesJabatan = jabatanFilter === 'Semua' || user.jabatan === jabatanFilter;
    const matchesLevel = levelFilter === 'Semua' || user.level === levelFilter;
    const uname = (user.username || '').toString().toLowerCase();
    const nname = (user.name || user.nama || '').toString().toLowerCase();
    const matchesSearch = uname.includes(searchQuery.toLowerCase()) || nname.includes(searchQuery.toLowerCase());
                          
    return matchesUnitKerja && matchesJabatan && matchesLevel && matchesSearch;
  });

  // Backend-driven pagination view
  const paginatedUsers = filteredUsers; // show what is fetched; filters are client-side
  const totalPages = meta?.last_page ?? 1;
  const totalItems = (meta && (meta.total ?? filteredUsers.length)) || filteredUsers.length;
  const startIndex = meta?.from ? meta.from - 1 : (currentPage - 1) * itemsPerPage;
  const endIndex = meta?.to ?? (startIndex + paginatedUsers.length);

  // Fungsi untuk membuat pagination links
  const renderPaginationLinks = () => {
    const pages = [];
    const maxVisiblePages = 5; // Tentukan jumlah link halaman yang terlihat

    // Tampilkan 1 link di awal jika tidak di halaman pertama
    if (currentPage > 1) {
      pages.push(
        <PaginationItem key="previous">
          <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>Previous</PaginationLink>
        </PaginationItem>
      );
    }

    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (startPage > 1) {
      pages.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => setCurrentPage(1)} isActive={currentPage === 1}>{1}</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => setCurrentPage(i)} isActive={currentPage === i}>{i}</PaginationLink>
        </PaginationItem>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => setCurrentPage(totalPages)} isActive={currentPage === totalPages}>{totalPages}</PaginationLink>
        </PaginationItem>
      );
    }

    // Tampilkan "Next" link jika bukan di halaman terakhir
    if (currentPage < totalPages) {
      pages.push(
        <PaginationItem key="next">
          <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>Next</PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  const UserBreadcrumb: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/referensi">Referensi</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Users</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader breadcrumbs={UserBreadcrumb} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 py-4 px-4 lg:px-6">
            <h1 className="text-2xl font-bold mb-6">Data Users</h1>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                  <div className="flex space-x-2 items-center">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>+ Tambah Data</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-screen-lg max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Form Users</DialogTitle>
                        </DialogHeader>
                        <UserForm onSubmit={handleAddSubmit} isEditing={false} onCancel={() => setIsAddDialogOpen(false)} defaultValues={undefined} jabatanList={jabatanList} unitKerjaOptions={unitKerjaOptions} defaultUnitKerja={meKodeUk} submitting={submittingAdd} />
                      </DialogContent>
                    </Dialog>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="data-per-halaman">Data Per Halaman</Label>
                      <Select 
                        onValueChange={(value) => {
                          setItemsPerPage(Number(value));
                          setCurrentPage(1); // Reset to page 1 when changing items per page
                        }} 
                        defaultValue={itemsPerPage.toString()}
                      >
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
                  <div className="flex flex-wrap items-center space-x-2 ml-auto gap-2">
                      {/* Filter Controls */}
                    <div className="flex items-center space-x-2">
                      <Label>Unit Kerja</Label>
                      <Select value={unitKerjaFilter} onValueChange={(value) => {
                        setUnitKerjaFilter(value);
                        setCurrentPage(1); // Reset to page 1 when filtering
                      }}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Semua">Semua</SelectItem>
                          {unitKerjaOptions.map((opt) => (
                            <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label>Jabatan</Label>
                      <Select value={jabatanFilter} onValueChange={(value) => {
                        setJabatanFilter(value);
                        setCurrentPage(1); // Reset to page 1 when filtering
                      }}>
                        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Semua">Semua</SelectItem>
                          {jabatanFilterOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label>Level</Label>
                      <Select value={levelFilter} onValueChange={(value) => {
                        setLevelFilter(value);
                        setCurrentPage(1); // Reset to page 1 when filtering
                      }}>
                        <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Semua">Semua</SelectItem>
                          {levelOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                      {/* Pencarian */}
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="pencarian">Pencarian :</Label>
                      <Input
                        id="pencarian"
                        placeholder="Cari Username/Nama"
                        className="w-[200px]"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1); // Reset to page 1 when searching
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>No</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Unit Kerja</TableHead>
                      <TableHead>Jabatan</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="text-center w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      Array.from({ length: 8 }).map((_, idx) => (
                        <TableRow key={`sk-${idx}`}>
                          <TableCell colSpan={8}>
                            <div className="animate-pulse h-5 bg-muted rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{startIndex + index + 1}</TableCell>
                          <TableCell>{user.username || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Button variant="outline" size="sm" onClick={() => openChangePassword(user)}>Ubah</Button>
                            </div>
                          </TableCell>
                          <TableCell>{user.name || user.nama || '-'}</TableCell>
                          <TableCell>{user.unit_kerja || user.kode_uk || '-'}</TableCell>
                          <TableCell>{user.jabatan || '-'}</TableCell>
                          <TableCell>{user.level || '-'}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center space-x-2">
                              <Button variant="outline" size="icon" onClick={() => handleEditClick(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus User?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tindakan ini tidak dapat dibatalkan. User akan dihapus secara permanen.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(user.id)}>Hapus</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">Tidak ada data</TableCell>
                      </TableRow>
                    )}
        {/* Dialog for Change Password */}
        <ChangePasswordDialog
          open={pwdDialogOpen}
          onOpenChange={setPwdDialogOpen}
          userId={pwdUser?.id ?? null}
          username={pwdUser?.username}
          onSuccess={() => { /* no list reload required */ }}
        />
                  </TableBody>
                </Table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Menampilkan {startIndex + 1} sampai {endIndex} dari {totalItems} data
                  </div>
                  <Pagination>
                    <PaginationContent>
                      {renderPaginationLinks()}
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialog for Edit User */}
        {editingUser && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-screen-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Form Users (Edit)</DialogTitle>
              </DialogHeader>
              <UserForm 
                defaultValues={editingUser} 
                onSubmit={handleEditSubmit} 
                isEditing={true} 
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setEditingUser(null);
                }}
                jabatanList={jabatanList}
                unitKerjaOptions={unitKerjaOptions}
              />
            </DialogContent>
          </Dialog>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}