'use client';

import { ReactNode, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, FileText } from 'lucide-react';

// Import FileUploader components
import {
  FileUploader,
  FileUploaderContent,
  FileUploaderItem,
} from '@/components/ui/file-uploader';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- DATA & SCHEMAS ---
const documentCategories = [
  'General',
  'Finance',
  'HR',
  'Legal',
  'Marketing',
];

const formSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, { message: 'At least one file is required' }),
  documentTitle: z.string().min(1, { message: 'Document Title is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// --- MAIN PAGE COMPONENT ---
export default function UploadPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
      documentTitle: '',
      category: '',
      description: '',
      tags: '',
    },
  });

  // Single source of truth for files via react-hook-form
  const files = form.watch('files') || [];

  const totalSize = useMemo(() => {
    return files.reduce((acc, f) => acc + (f?.size || 0), 0);
  }, [files]);

  const onSubmit = (data: FormValues) => {
    console.log('Form Submitted:', data);
    // Handle form submission logic here
  };

  const UploadBreadcrumb: ReactNode = (
    <BreadcrumbList>
      <BreadcrumbItem>
        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Upload Documents</BreadcrumbPage>
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
        <SiteHeader breadcrumbs={UploadBreadcrumb} />
        <div className="flex flex-1 flex-col overflow-auto bg-gray-50">
          <div className="px-4 py-4 lg:px-6">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Upload Documents</h1>
              <p className="text-sm text-muted-foreground">Upload documents to the university digital archive</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">Select Files</CardTitle>
                      <p className="text-sm text-muted-foreground">Drag and drop files or click to browse. Maximum file size: 50MB</p>
                      <p className="text-xs text-muted-foreground mt-1">Supported formats: PDF, DOCX, XLSX, PPT, PPTX</p>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="files"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <FileUploader
                                value={field.value}
                                onValueChange={(newFiles) => {
                                  form.setValue('files', newFiles as File[], { shouldValidate: true, shouldDirty: true });
                                }}
                                reSelect={true}
                                dropzoneOptions={{
                                  multiple: true,
                                  maxSize: 50 * 1024 * 1024,
                                  accept: {
                                    'application/pdf': ['.pdf'],
                                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                                    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                                  },
                                }}
                                className="relative bg-background rounded-lg p-6 border-dashed border-2 hover:border-muted-foreground/50 transition-colors"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {files.length > 0 && (
                        <FileUploaderContent>
                          {files.map((file, i) => (
                            <FileUploaderItem key={i} index={i}>
                              <FileText className="h-4 w-4" />
                              <span>{file.name}</span>
                            </FileUploaderItem>
                          ))}
                        </FileUploaderContent>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold">Document Information</CardTitle>
                      <p className="text-sm text-muted-foreground">Provide details about the document for better organization</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="documentTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Document Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter document title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {documentCategories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Brief description of the document content" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter tags separated by commas (e.g., budget, 2024, finance)" {...field} />
                            </FormControl>
                            <p className="text-xs text-muted-foreground">Tags help others find your document more easily</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="bg-muted p-4 rounded-md flex items-start gap-2">
                        <FileText className="h-5 w-5 mt-1 text-muted-foreground" />
                        <div>
                          <Label className="font-semibold">Upload Permissions</Label>
                          <p className="text-sm text-muted-foreground">This document will be submitted for director approval before being available in the archive</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm flex justify-between"><span>Files selected</span><span className="font-medium">{files.length}</span></div>
                      <div className="text-sm flex justify-between"><span>Total size</span><span className="font-medium">{(totalSize / (1024 * 1024)).toFixed(2)} MB</span></div>
                      <div className="text-xs text-muted-foreground">Make sure each file is under 50 MB and contents are correct before submitting.</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base font-semibold">Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2 text-muted-foreground">
                      <p>- Use clear titles and add relevant tags.</p>
                      <p>- Supported: PDF, DOCX, XLSX, PPTX.</p>
                      <p>- Submissions go through director approval.</p>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2 justify-end lg:justify-start">
                    <Button type="button" variant="secondary" onClick={() => form.reset()}>
                      Reset
                    </Button>
                    <Button type="submit" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Submit for Approval
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}