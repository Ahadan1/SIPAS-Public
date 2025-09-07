<?php

namespace Database\Seeders;

use App\Models\RefTujuan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class RefTujuanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RefTujuan::truncate();
        Schema::enableForeignKeyConstraints();

        $refTujuanData = [
            ['nama' => 'Internal Sekolah', 'kode' => 'INT', 'uraian' => 'Untuk komunikasi internal sekolah'],
            ['nama' => 'Dinas Pendidikan', 'kode' => 'DISDIK', 'uraian' => 'Untuk komunikasi dengan Dinas Pendidikan'],
            ['nama' => 'Orang Tua/Wali', 'kode' => 'ORTU', 'uraian' => 'Untuk komunikasi dengan orang tua siswa'],
            ['nama' => 'Komite Sekolah', 'kode' => 'KOMITE', 'uraian' => 'Untuk komunikasi dengan komite sekolah'],
            ['nama' => 'Perguruan Tinggi', 'kode' => 'PT', 'uraian' => 'Untuk komunikasi dengan universitas/institut'],
            ['nama' => 'Instansi Pemerintah', 'kode' => 'PEMDA', 'uraian' => 'Untuk komunikasi dengan instansi pemerintah'],
            ['nama' => 'Sekolah Lain', 'kode' => 'SEKOLAH', 'uraian' => 'Untuk komunikasi dengan sekolah lain'],
            ['nama' => 'Media Massa', 'kode' => 'MEDIA', 'uraian' => 'Untuk komunikasi dengan media massa'],
            ['nama' => 'Vendor/Supplier', 'kode' => 'VENDOR', 'uraian' => 'Untuk komunikasi dengan penyedia barang/jasa'],
            ['nama' => 'Alumni', 'kode' => 'ALUMNI', 'uraian' => 'Untuk komunikasi dengan alumni sekolah'],
        ];

        foreach ($refTujuanData as $data) {
            RefTujuan::create($data);
        }
    }
}
