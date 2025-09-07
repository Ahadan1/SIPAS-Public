"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

// Schema based on legacy fields: id_surat (hidden/prop), id_jabatan, tgl_paraf, catatan
const schema = z.object({
  id_surat: z.number().int().nonnegative(),
  id_jabatan: z.string().min(1, "Pilih jabatan"),
  // Keep simple to support older zod versions
  tgl_paraf: z.date(),
  catatan: z.string(),
});

export type LembarPantauValues = z.infer<typeof schema>;

export type JabatanItem = { id: number; nama: string };

export function LembarPantauForm({
  suratId,
  defaultValues,
  onSaved,
  onCancel,
  title = "Form Lembar Pantau",
}: {
  suratId: number;
  defaultValues?: Partial<LembarPantauValues>;
  onSaved?: (data: any) => void;
  onCancel?: () => void;
  title?: string;
}) {
  const form = useForm<LembarPantauValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id_surat: suratId,
      id_jabatan: defaultValues?.id_jabatan ?? "",
      tgl_paraf: defaultValues?.tgl_paraf ?? new Date(),
      catatan: defaultValues?.catatan ?? "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [jabatan, setJabatan] = useState<JabatanItem[]>([]);
  const [loadingJabatan, setLoadingJabatan] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingJabatan(true);
      try {
        // Try new endpoint first, fallback to ref endpoint
        let list: any = await apiFetch("/api/v1/jabatan", { auth: true });
        if (Array.isArray(list?.data)) list = list.data;
        if (!Array.isArray(list)) {
          list = await apiFetch("/api/v1/ref-jabatan", { auth: true });
          list = Array.isArray(list?.data) ? list.data : list;
        }
        const items: JabatanItem[] = (list || []).map((x: any) => ({
          id: Number(x.id ?? x.ID ?? x.value ?? 0),
          nama: String(
            x.nama_jabatan ??
            x.nama ??
            x.name ??
            x.label ??
            x.text ??
            x.title ??
            "-"
          ),
        }));
        setJabatan(items);
      } catch (e: any) {
        toast.error(e?.message || "Gagal memuat Jabatan");
      } finally {
        setLoadingJabatan(false);
      }
    };
    load();
  }, []);

  const onSubmit = async (values: LembarPantauValues) => {
    setSaving(true);
    try {
      const payload = {
        id_surat: values.id_surat,
        id_jabatan: Number(values.id_jabatan),
        tgl_paraf: format(values.tgl_paraf, "yyyy-MM-dd"),
        catatan: values.catatan ?? "",
      };
      // Try several possible endpoints to accommodate different backends
      const candidates = [
        "/api/v1/lembar-pantau",
        "/api/v1/lembar-pantaus",
        "/api/v1/lembar_pantau",
        "/api/v1/lembar_pantaus",
        `/api/v1/surat-keluar/${values.id_surat}/lembar-pantau`,
        `/api/v1/surat-keluar/${values.id_surat}/lembar_pantau`,
        "/api/lembar-pantau",
        "/api/lembar-pantaus",
        "/api/lembar_pantau",
        "/api/lembar_pantaus",
        "/lembar-pantau",
        "/lembar-pantaus",
        "/lembar_pantau",
        "/lembar_pantaus",
      ];
      let res: any | null = null;
      let lastErr: any = null;
      for (const path of candidates) {
        try {
          res = await apiFetch(path, { method: "POST", auth: true, body: payload, parseJson: true });
          break;
        } catch (e) {
          lastErr = e;
        }
      }
      if (!res) throw (lastErr || new Error("Endpoint Lembar Pantau tidak ditemukan."));
      toast.success("Lembar pantau tersimpan");
      onSaved?.(res);
    } catch (e: any) {
      toast.error(e?.message || "Gagal menyimpan lembar pantau");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="id_jabatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jabatan</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} disabled={loadingJabatan}>
                      <SelectTrigger aria-label="Pilih jabatan">
                        <SelectValue placeholder={loadingJabatan ? "Memuat..." : "Pilih jabatan"} />
                      </SelectTrigger>
                      <SelectContent>
                        {jabatan.map((j) => (
                          <SelectItem key={j.id} value={String(j.id)}>{j.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tgl_paraf"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tgl Paraf</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                          type="button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(d) => d && field.onChange(d)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="catatan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Catatan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden id_surat binding for clarity */}
            <Input type="hidden" value={suratId} readOnly />

            <div className="flex justify-start gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Menyimpan..." : "Save"}</Button>
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default LembarPantauForm;
