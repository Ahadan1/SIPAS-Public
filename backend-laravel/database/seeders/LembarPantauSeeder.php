<?php

namespace Database\Seeders;

use App\Models\LembarPantau;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class LembarPantauSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        LembarPantau::truncate();
        Schema::enableForeignKeyConstraints();

        $lembarPantauData = [
            [
                'id_surat' => 1, // Reference to surat masuk
                'id_jabatan' => 2, // Kepala Sekolah
                'catatan' => 'Sudah dibahas dalam rapat koordinasi. Akan dihadiri sesuai jadwal.',
                'tgl_paraf' => now()->subDays(6),
                'tgl_input' => now()->subDays(6),
                'status' => 'Selesai',
            ],
            [
                'id_surat' => 2, // Reference to surat masuk
                'id_jabatan' => 5, // Wakil Kepala Kurikulum
                'catatan' => 'Petunjuk teknis sudah dipelajari. Perlu sosialisasi ke guru-guru.',
                'tgl_paraf' => now()->subDays(8),
                'tgl_input' => now()->subDays(9),
                'status' => 'Dalam Proses',
            ],
            [
                'id_surat' => 3, // Reference to surat masuk
                'id_jabatan' => 2, // Kepala Sekolah
                'catatan' => 'Proposal disetujui. Koordinasi dengan komite untuk pelaksanaan.',
                'tgl_paraf' => now()->subDays(3),
                'tgl_input' => now()->subDays(4),
                'status' => 'Selesai',
            ],
            [
                'id_surat' => 4, // Reference to surat masuk
                'id_jabatan' => 6, // Wakil Kepala Kesiswaan
                'catatan' => 'Izin disetujui. Siswa sudah diberitahu dan disiapkan administrasinya.',
                'tgl_paraf' => now()->subDays(1),
                'tgl_input' => now()->subDays(2),
                'status' => 'Selesai',
            ],
            [
                'id_surat' => 5, // Reference to surat masuk
                'id_jabatan' => 8, // Wakil Kepala Humas
                'catatan' => 'Sedang dalam tahap negosiasi program kerjasama. Menunggu persetujuan komite.',
                'tgl_paraf' => now()->subDays(5),
                'tgl_input' => now()->subDays(7),
                'status' => 'Dalam Proses',
            ],
            [
                'id_surat' => 6, // Reference to surat masuk
                'id_jabatan' => 4, // Kepala Tata Usaha
                'catatan' => 'Penawaran sedang dikaji. Perlu perbandingan harga dengan vendor lain.',
                'tgl_paraf' => now()->subDays(2),
                'tgl_input' => now()->subDays(3),
                'status' => 'Dalam Proses',
            ],
            [
                'id_surat' => 7, // Reference to surat masuk
                'id_jabatan' => 6, // Wakil Kepala Kesiswaan
                'catatan' => 'Jadwal sosialisasi sudah ditetapkan. Koordinasi dengan guru BK.',
                'tgl_paraf' => now()->subDays(4),
                'tgl_input' => now()->subDays(5),
                'status' => 'Selesai',
            ],
            [
                'id_surat' => 8, // Reference to surat masuk
                'id_jabatan' => 2, // Kepala Sekolah
                'catatan' => 'Program beasiswa sangat baik. Akan disosialisasikan ke siswa berprestasi.',
                'tgl_paraf' => now()->subDays(7),
                'tgl_input' => now()->subDays(8),
                'status' => 'Selesai',
            ],
        ];

        foreach ($lembarPantauData as $data) {
            LembarPantau::create([
                'id_surat' => $data['id_surat'],
                'id_jabatan' => $data['id_jabatan'],
                'catatan' => $data['catatan'],
                'tgl_paraf' => $data['tgl_paraf'],
                'tgl_input' => $data['tgl_input'],
                'status' => $data['status'] ?? 'Dalam Proses',
                'created_by' => $data['id_jabatan'],
                'updated_by' => $data['id_jabatan'],
            ]);
        }
    }
}
