<?php

namespace Database\Seeders;

use App\Models\RefKlasifikasi;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class RefKlasifikasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RefKlasifikasi::truncate();
        Schema::enableForeignKeyConstraints();

        $refKlasifikasiData = [
            ['nama' => 'Akademik', 'kode' => 'AK', 'uraian' => 'Klasifikasi untuk dokumen akademik dan kurikulum'],
            ['nama' => 'Keuangan', 'kode' => 'KU', 'uraian' => 'Klasifikasi untuk dokumen keuangan dan anggaran'],
            ['nama' => 'Sumber Daya Manusia', 'kode' => 'SDM', 'uraian' => 'Klasifikasi untuk dokumen kepegawaian'],
            ['nama' => 'Humas dan Kerjasama', 'kode' => 'HM', 'uraian' => 'Klasifikasi untuk dokumen hubungan masyarakat'],
            ['nama' => 'Sarana Prasarana', 'kode' => 'SPR', 'uraian' => 'Klasifikasi untuk dokumen fasilitas sekolah'],
            ['nama' => 'Kesiswaan', 'kode' => 'KSW', 'uraian' => 'Klasifikasi untuk dokumen terkait siswa'],
            ['nama' => 'Tata Usaha', 'kode' => 'TU', 'uraian' => 'Klasifikasi untuk dokumen administrasi umum'],
            ['nama' => 'Keamanan', 'kode' => 'KAM', 'uraian' => 'Klasifikasi untuk dokumen keamanan sekolah'],
            ['nama' => 'Kesehatan', 'kode' => 'KES', 'uraian' => 'Klasifikasi untuk dokumen kesehatan sekolah'],
            ['nama' => 'Ekstrakurikuler', 'kode' => 'EKS', 'uraian' => 'Klasifikasi untuk dokumen kegiatan ekstrakurikuler'],
        ];

        foreach ($refKlasifikasiData as $data) {
            RefKlasifikasi::create($data);
        }
    }
}
