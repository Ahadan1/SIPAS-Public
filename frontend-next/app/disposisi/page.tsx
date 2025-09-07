'use client';

import { useState, ReactNode } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form'; // Import Controller
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Package,
  Clock,
  Clipboard,
  CheckCircle,
  Search,
} from 'lucide-react';

// Import sidebar and header components from the provided example
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Import the new MultiSelect component
import { MultiSelect, Option } from '@/components/ui/multi-select';

// shadcn/ui components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// --- MOCK DATA ---
const disposisiData = {
  received: [
    { id: 1, from: 'Direktur', subject: 'Penting', date: '2025-08-01', status: 'Pending Action' },
    { id: 2, from: 'Wakil Direktur', subject: 'Tinjauan Proposal', date: '2025-07-28', status: 'Under Review' },
  ],
  sent: [
    { id: 3, to: 'Kepala BAS', subject: 'Penugasan Proyek A', date: '2025-08-05', status: 'Under Review' },
    { id: 4, to: 'Koord. PPF', subject: 'Koordinasi Rapat', date: '2025-08-04', status: 'Completed' },
  ],
};

const userRoles = [
  'Wakil Direktur',
  'Kepala BAS',
  'Koord. PPF',
  'Koord. PPK',
];

// Options for the MultiSelect component
const recipientOptions: Option[] = userRoles.map(role => ({
  value: role,
  label: role,
}));

// --- FORM SCHEMA ---
const formSchema = z.object({
  // Change recipient field to an array of strings
  recipient: z.array(z.string()).min(1, { message: 'At least one recipient is required' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// --- CREATE DISPOSITION FORM COMPONENT ---
function CreateDispositionForm({ onClose }: { onClose: () => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: [], // Default value is now an empty array
      subject: '',
      message: '',
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log('New Disposition:', data);
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
        {/* Disposition Rules Section */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clipboard className="h-4 w-4" />
            <h4 className="font-semibold">Disposition Workflow Rules</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Understanding the hierarchy and flow rules
          </p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium">Sending Rules:</h5>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Level 1→2 → Level 3</li>
                <li>Level 3 → Level 4</li>
                <li>Level 4 → Level 5</li>
                <li>Level 5 can only execute</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium">Process Flow:</h5>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Sent → Reviewed → Approved → Executed</li>
                <li>Level 5 executes</li>
                <li>Level 4 reviews execution</li>
                <li>Level 3 approves after review</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2l-7.5 20.5-2.999-7.142L2 11.5l20-9.5z" />
              </svg>
            </span>
            <h4 className="font-semibold">Create New Disposition</h4>
          </div>
          <p className="text-sm text-muted-foreground">
            Send disposition to lower level according to workflow rules
          </p>
          
          {/* Use the new MultiSelect component for multiple recipients */}
          <FormField
            control={form.control}
            name="recipient"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send To</FormLabel>
                <FormControl>
                  <MultiSelect 
                    options={recipientOptions} 
                    selected={field.value} 
                    onChange={field.onChange}
                    placeholder="Select one or more recipients"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input placeholder="Enter disposition subject" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Content</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter disposition message..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <p className="text-sm text-muted-foreground">
              As Direktur (Level 1), you can send dispositions to Level 3, Level 3, Level 5 roles.
            </p>
          </div>
          <Button type="submit" className="w-full">
            Send Disposition
          </Button>
        </div>
      </form>
    </Form>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function DisposisiPage() {
  const [activeTab, setActiveTab] = useState('received');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const disposisiStatus = {
    totalReceived: disposisiData.received.length,
    pendingAction: disposisiData.received.filter(d => d.status === 'Pending Action').length,
    underReview: disposisiData.received.filter(d => d.status === 'Under Review').length,
    completed: disposisiData.received.filter(d => d.status === 'Completed').length,
    totalSent: disposisiData.sent.length,
  };

  const currentTabContent = activeTab === 'received' ? disposisiData.received : disposisiData.sent;

  // Breadcrumb component definition
  const DisposisiBreadcrumb: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/disposisi">Disposisi</BreadcrumbLink>
      </BreadcrumbItem>
    </BreadcrumbList>
  );

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "19rem",
      } as React.CSSProperties}
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader breadcrumbs={DisposisiBreadcrumb} />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2 py-4 px-4 lg:px-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Disposisi</h1>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>+ Buat Disposisi</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] p-0">
                  <DialogHeader className="p-6">
                    <DialogTitle className="hidden">Membuat Disposisi Baru</DialogTitle>
                  </DialogHeader>
                  <CreateDispositionForm onClose={() => setIsDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground -mt-4 mb-4">
              Manage document disposition workflow - Direktur (Level 1)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Received</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{disposisiStatus.totalReceived}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Action</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{disposisiStatus.pendingAction}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                  <Clipboard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{disposisiStatus.underReview}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{disposisiStatus.completed}</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="received">
                    Disposisi Masuk ({disposisiData.received.length})
                  </TabsTrigger>
                  <TabsTrigger value="sent">
                    Disposisi Keluar ({disposisiData.sent.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-full max-w-sm sm:w-auto mt-2 sm:mt-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Cari Disposisi..." className="pl-9" />
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeTab}>
                  <TabsContent value="received" className="mt-0">
                    {disposisiData.received.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>From</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {disposisiData.received.map((disposisi) => (
                              <TableRow key={disposisi.id}>
                                <TableCell>{disposisi.from}</TableCell>
                                <TableCell>{disposisi.subject}</TableCell>
                                <TableCell>{disposisi.date}</TableCell>
                                <TableCell>{disposisi.status}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        Disposisi Masuk Tidak Ditemukan.
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="sent" className="mt-0">
                    {disposisiData.sent.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>To</TableHead>
                              <TableHead>Subject</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {disposisiData.sent.map((disposisi) => (
                              <TableRow key={disposisi.id}>
                                <TableCell>{disposisi.to}</TableCell>
                                <TableCell>{disposisi.subject}</TableCell>
                                <TableCell>{disposisi.date}</TableCell>
                                <TableCell>{disposisi.status}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        Disposisi Keluar Tidak Ditemukan.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}