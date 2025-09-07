<?php

namespace Database\Seeders;

use App\Models\RefJabatan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class RefJabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RefJabatan::truncate();
        Schema::enableForeignKeyConstraints();

        $refJabatanData = [
            ['nama' => 'Kepala Sekolah', 'kode' => 'KEPSEK', 'level' => 1],
            ['nama' => 'Wakil Kepala Sekolah', 'kode' => 'WAKASEK', 'level' => 2],
            ['nama' => 'Kepala Tata Usaha', 'kode' => 'KTU', 'level' => 3],
            ['nama' => 'Wakil Kepala Kurikulum', 'kode' => 'WAKAKUR', 'level' => 2],
            ['nama' => 'Wakil Kepala Kesiswaan', 'kode' => 'WAKASIS', 'level' => 2],
            ['nama' => 'Wakil Kepala Sarana Prasarana', 'kode' => 'WAKASARPRAS', 'level' => 2],
            ['nama' => 'Wakil Kepala Humas', 'kode' => 'WAKAHUMAS', 'level' => 2],
            ['nama' => 'Koordinator BK', 'kode' => 'KORBK', 'level' => 4],
            ['nama' => 'Koordinator Perpustakaan', 'kode' => 'KORPUS', 'level' => 4],
            ['nama' => 'Koordinator Laboratorium', 'kode' => 'KORLAB', 'level' => 4],
            ['nama' => 'Guru Mata Pelajaran', 'kode' => 'GURU', 'level' => 5],
            ['nama' => 'Guru BK', 'kode' => 'GURUBK', 'level' => 5],
            ['nama' => 'Staf Administrasi', 'kode' => 'ADMIN', 'level' => 6],
            ['nama' => 'Bendahara', 'kode' => 'BEND', 'level' => 4],
            ['nama' => 'Sekretaris', 'kode' => 'SEK', 'level' => 5],
        ];

        foreach ($refJabatanData as $data) {
            RefJabatan::create($data);
        }
    }
}
