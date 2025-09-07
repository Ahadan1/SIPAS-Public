<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class KlasifikasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('klasifikasi')->truncate();
        Schema::enableForeignKeyConstraints();

        DB::table('klasifikasi')->insert([
            [
                'kode_klasifikasi' => 'KU.001',
                'nama_klasifikasi' => 'Keuangan',
                'deskripsi' => 'Dokumen terkait keuangan dan anggaran.'
            ],
            [
                'kode_klasifikasi' => 'AK.001',
                'nama_klasifikasi' => 'Akademik',
                'deskripsi' => 'Dokumen terkait kegiatan akademik, kurikulum, dan mahasiswa.'
            ],
            [
                'kode_klasifikasi' => 'SDM.001',
                'nama_klasifikasi' => 'Sumber Daya Manusia',
                'deskripsi' => 'Dokumen terkait kepegawaian, dosen, dan staf.'
            ],
            [
                'kode_klasifikasi' => 'HM.001',
                'nama_klasifikasi' => 'Humas dan Kerjasama',
                'deskripsi' => 'Dokumen terkait hubungan masyarakat dan kerjasama eksternal.'
            ],
        ]);
    }
}
