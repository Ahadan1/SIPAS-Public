<?php

namespace Database\Seeders;

use App\Models\RefPenandatanganan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class RefPenandatangananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RefPenandatanganan::truncate();
        Schema::enableForeignKeyConstraints();

        $refPenandatangananData = [
            ['nama' => 'Dr. Ahmad Suryanto, M.Pd', 'jabatan' => 'Kepala Sekolah'],
            ['nama' => 'Dra. Siti Nurhaliza, M.M', 'jabatan' => 'Wakil Kepala Sekolah'],
            ['nama' => 'Bambang Wijaya, S.Pd', 'jabatan' => 'Kepala Tata Usaha'],
            ['nama' => 'Indira Sari, M.Pd', 'jabatan' => 'Wakil Kepala Kurikulum'],
            ['nama' => 'Rudi Hartono, S.Pd', 'jabatan' => 'Wakil Kepala Kesiswaan'],
            ['nama' => 'Maya Sari, S.E', 'jabatan' => 'Koordinator Keuangan'],
            ['nama' => 'Prof. Dr. Widodo Santoso', 'jabatan' => 'Koordinator Akademik'],
            ['nama' => 'Dewi Kartika, M.Pd', 'jabatan' => 'Koordinator Humas'],
        ];

        foreach ($refPenandatangananData as $data) {
            RefPenandatanganan::create($data);
        }
    }
}
