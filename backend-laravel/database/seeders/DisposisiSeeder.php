<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DisposisiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('disposisi')->insert([
            ['surat_masuk_id' => 1, 'pengirim_id' => 1, 'penerima_id' => 2, 'catatan' => 'Mohon diagendakan', 'status' => 'Dikirim'],
            ['surat_masuk_id' => 1, 'pengirim_id' => 1, 'penerima_id' => 3, 'catatan' => 'Untuk diselesaikan', 'status' => 'Dikirim'],
            ['surat_masuk_id' => 1, 'pengirim_id' => 1, 'penerima_id' => 4, 'catatan' => 'Untuk diketahui', 'status' => 'Dikirim'],
            ['surat_masuk_id' => 1, 'pengirim_id' => 1, 'penerima_id' => 5, 'catatan' => 'Arsip', 'status' => 'Dikirim'],
            ['surat_masuk_id' => 1, 'pengirim_id' => 1, 'penerima_id' => 6, 'catatan' => 'Mohon diteliti', 'status' => 'Dikirim'],
            ['surat_masuk_id' => 1, 'pengirim_id' => 1, 'penerima_id' => 7, 'catatan' => 'Dibahas bersama', 'status' => 'Dikirim'],
            ['surat_masuk_id' => 1, 'pengirim_id' => 1, 'penerima_id' => 8, 'catatan' => 'Mohon disiapkan jawaban', 'status' => 'Dikirim'],
        ]);
    }
}
