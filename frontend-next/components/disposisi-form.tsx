"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

// Define the schema for the disposisi form
const disposisiFormSchema = z.object({
  disposisiTo: z.array(z.string()).min(1, 'Pilih setidaknya satu tujuan disposisi.'),
  disposisiContent: z.array(z.string()).min(1, 'Pilih setidaknya satu isi disposisi.'),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

type DisposisiFormValues = z.infer<typeof disposisiFormSchema>;

// Mock data for the checkboxes
const disposisiToOptions = [
  // Left column
  { id: 'direktur', label: 'Direktur' },
  { id: 'kepala-bas', label: 'Kepala BAS' },
  { id: 'koord-ppk', label: 'Koord. PPK' },
  { id: 'koord-sekretariat', label: 'Koord. Sekretariat' },
  { id: 'drafter-ppf', label: 'Drafter: PPF' },
  { id: 'drafter-keuangan', label: 'Drafter: Keuangan' },
  { id: 'drafter-sdm-1', label: 'Drafter: SDM' },
  { id: 'kaprodi-kajian-wilayah-amerika', label: 'Kaprodi Kajian Wilayah Amerika' },
  { id: 'kaprodi-kajian-gender', label: 'Kaprodi Kajian Gender' },
  { id: 'kaprodi-kajian-timur-tengah', label: 'Kaprodi Kajian Wilayah Timur Tengah dan Islam' },
  { id: 'kaprodi-kajian-eropa', label: 'Kaprodi Kajian Wilayah Eropa' },
  { id: 'kaprodi-magister-sl', label: 'Kaprodi Magister SL' },
  { id: 'koordinator-umk', label: 'Koord. UMK' },
  { id: 'kaprodi-kajian-skgs', label: 'Kaprodi Kajian SKGS' },
  { id: 'staf-skgs', label: 'Staf Khusus Direktur Bidang Pengembangan dan Penjaminan Mutu Akademik SKGS' },
  { id: 'skg-bidang-pengembangan', label: 'SKG Bidang Pengembangan dan Penjaminan Mutu Akademik dan Kerjasama SL' },
  { id: 'ketua-komite-skg', label: 'Ketua Komite SKG' },
  { id: 'kaprodi-magister-mms-sl', label: 'Kaprodi Magister MMS SL' },
  { id: 'koordinator-pkv', label: 'Koord. PKV' },
  { id: 'manajer-riset-sl', label: 'Manajer Riset SL' },
  // Right column
  { id: 'wakil-direktur', label: 'Wakil Direktur' },
  { id: 'koord-ppf', label: 'Koord. PPF' },
  { id: 'koord-keuangan', label: 'Koord. Keuangan' },
  { id: 'koord-smmk', label: 'Koord. SMMK' },
  { id: 'drafter-ppk', label: 'Drafter: PPK' },
  { id: 'drafter-sdm-2', label: 'Drafter: SDM' },
  { id: 'kaprodi-kajian-ketahanan-nasional', label: 'Kaprodi Kajian Ketahanan Nasional' },
  { id: 'kaprodi-kajian-wilayah-jepang', label: 'Kaprodi Kajian Wilayah Jepang' },
  { id: 'kaprodi-kajian-ilmu-kepolisian', label: 'Kaprodi Kajian Ilmu Kepolisian' },
  { id: 'kaprodi-kajian-pengembangan-pendidikan', label: 'Kaprodi Kajian Pengembangan Pendidikan' },
  { id: 'kaprodi-kajian-terorisme', label: 'Kaprodi Kajian Terorisme' },
  { id: 'kaprodi-doktor-sl', label: 'Kaprodi Doktor SL' },
  { id: 'kepala-bas-2', label: 'Kepala BAS' },
  { id: 'staf-khusus-direktur', label: 'Staf Khusus Direktur Bidang Penjaminan Mutu Akademik dan Kerjasama SL' },
  { id: 'skd-bidang-pengembangan', label: 'SKD Bidang Pengembangan dan Penjaminan Mutu Akademik SKG' },
  { id: 'ketua-komite-sl', label: 'Ketua Komite SL' },
  { id: 'kaprodi-s3-ksg', label: 'Kaprodi S3 KSG' },
  { id: 'ketua-unit-penjaminan-mutu', label: 'Ketua Unit Penjaminan Mutu Akademik' },
  { id: 'ketua-komite-etik', label: 'Ketua Komite Etik' },
  { id: 'staf-khusus-pimpinan', label: 'Staf Khusus Pimpinan Bidang Penelitian dan Pengabdian kepada masyarakat' },
];

const disposisiContentOptions = [
  'Mohon diagendakan',
  'Untuk diselesaikan',
  'Untuk diketahui',
  'Arsip',
  'Mohon diteliti',
  'Dibahas bersama',
  'Mohon disiapkan jawaban',
];

export function DisposisiForm() {
  const form = useForm<DisposisiFormValues>({
    resolver: zodResolver(disposisiFormSchema),
    defaultValues: {
      disposisiTo: [],
      disposisiContent: [],
      deadline: '',
      notes: '',
    },
  });

  const onSubmit = (values: DisposisiFormValues) => {
    console.log("Disposisi Form Submitted:", values);
    toast.success("Disposisi berhasil disimpan!");
  };

  const handleCancel = () => {
    form.reset();
    toast.info("Formulir disposisi telah direset.");
  };

  const halfwayIndex = Math.ceil(disposisiToOptions.length / 2);
  const disposisiToLeftColumn = disposisiToOptions.slice(0, halfwayIndex);
  const disposisiToRightColumn = disposisiToOptions.slice(halfwayIndex);

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Form Disposisi</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="disposisiTo"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Disposisi Kepada</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          {disposisiToLeftColumn.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="disposisiTo"
                              render={({ field }) => (
                                <FormItem key={option.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), option.id])
                                          : field.onChange((field.value || []).filter((value: string) => value !== option.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">{option.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <div className="space-y-2">
                          {disposisiToRightColumn.map((option) => (
                            <FormField
                              key={option.id}
                              control={form.control}
                              name="disposisiTo"
                              render={({ field }) => (
                                <FormItem key={option.id} className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), option.id])
                                          : field.onChange((field.value || []).filter((value: string) => value !== option.id));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">{option.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="disposisiContent"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Isi Disposisi</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {disposisiContentOptions.map((option) => (
                          <FormField
                            key={option}
                            control={form.control}
                            name="disposisiContent"
                            render={({ field }) => (
                              <FormItem key={option} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), option])
                                        : field.onChange((field.value || []).filter((value: string) => value !== option));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">{option}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batas Waktu</FormLabel>
                      <FormControl>
                        <Input placeholder="Batas Waktu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
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

                <div className="flex justify-start gap-4 mt-6">
                  <Button type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.827-2.828z" />
                    </svg>
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="hidden lg:block">
          <CardHeader>
            <CardTitle>Tembusan</CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-sm font-medium mb-2">Tujuan disposisi yang dipilih:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {form.watch('disposisiTo').map((id) => (
                <li key={id}>{disposisiToOptions.find(opt => opt.id === id)?.label}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DisposisiForm;
