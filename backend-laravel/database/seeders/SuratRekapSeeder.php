<?php

namespace Database\Seeders;

use App\Models\SuratRekap;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class SuratRekapSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        SuratRekap::truncate();
        Schema::enableForeignKeyConstraints();

        $rekapData = [
            [
                'tanggal' => '2024-08-31',
                'tahun' => '2024',
                'kode_uk' => 'AKD',
                'jumlah_surat_masuk' => 25,
                'jumlah_surat_keluar' => 18,
                'keterangan' => 'Rekap surat bulan Agustus 2024 untuk bidang akademik',
            ],
            [
                'tanggal' => '2024-07-31',
                'tahun' => '2024',
                'kode_uk' => 'AKD',
                'jumlah_surat_masuk' => 22,
                'jumlah_surat_keluar' => 15,
                'keterangan' => 'Rekap surat bulan Juli 2024 untuk bidang akademik',
            ],
            [
                'tanggal' => '2024-08-31',
                'tahun' => '2024',
                'kode_uk' => 'KSW',
                'jumlah_surat_masuk' => 18,
                'jumlah_surat_keluar' => 12,
                'keterangan' => 'Rekap surat bulan Agustus 2024 untuk bidang kesiswaan',
            ],
            [
                'tanggal' => '2024-08-31',
                'tahun' => '2024',
                'kode_uk' => 'HUM',
                'jumlah_surat_masuk' => 15,
                'jumlah_surat_keluar' => 20,
                'keterangan' => 'Rekap surat bulan Agustus 2024 untuk bidang humas',
            ],
            [
                'tanggal' => '2024-08-31',
                'tahun' => '2024',
                'kode_uk' => 'KTU',
                'jumlah_surat_masuk' => 30,
                'jumlah_surat_keluar' => 25,
                'keterangan' => 'Rekap surat bulan Agustus 2024 untuk tata usaha',
            ],
            [
                'tanggal' => '2024-06-30',
                'tahun' => '2024',
                'kode_uk' => 'AKD',
                'jumlah_surat_masuk' => 28,
                'jumlah_surat_keluar' => 22,
                'keterangan' => 'Rekap surat bulan Juni 2024 untuk bidang akademik',
            ],
        ];

        foreach ($rekapData as $index => $data) {
            SuratRekap::create([
                'tanggal' => $data['tanggal'],
                'tahun' => $data['tahun'],
                'kode_uk' => $data['kode_uk'],
                'file_path' => 'documents/rekap/rekap_' . str_pad($index + 1, 3, '0', STR_PAD_LEFT) . '.xlsx',
                'jumlah_surat_masuk' => $data['jumlah_surat_masuk'] ?? null,
                'jumlah_surat_keluar' => $data['jumlah_surat_keluar'] ?? null,
                'keterangan' => $data['keterangan'] ?? null,
                'created_by' => 4, // Kepala Tata Usaha
                'updated_by' => 4,
            ]);
        }
    }
}
