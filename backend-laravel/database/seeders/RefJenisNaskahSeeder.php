<?php

namespace Database\Seeders;

use App\Models\RefJenisNaskah;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class RefJenisNaskahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RefJenisNaskah::truncate();
        Schema::enableForeignKeyConstraints();

        $refJenisNaskahData = [
            ['nama' => 'Surat Keputusan', 'kode' => 'SK', 'uraian' => 'Surat keputusan resmi dari pimpinan sekolah'],
            ['nama' => 'Surat Edaran', 'kode' => 'SE', 'uraian' => 'Surat pemberitahuan atau penjelasan kepada pihak tertentu'],
            ['nama' => 'Surat Tugas', 'kode' => 'ST', 'uraian' => 'Surat yang memberikan tugas kepada guru atau staff'],
            ['nama' => 'Nota Dinas', 'kode' => 'ND', 'uraian' => 'Komunikasi internal antar bagian di sekolah'],
            ['nama' => 'Surat Dinas', 'kode' => 'SD', 'uraian' => 'Surat resmi untuk komunikasi eksternal'],
            ['nama' => 'Undangan', 'kode' => 'UND', 'uraian' => 'Surat undangan untuk kegiatan atau rapat'],
            ['nama' => 'Laporan', 'kode' => 'LPR', 'uraian' => 'Laporan kegiatan atau hasil evaluasi'],
            ['nama' => 'Permohonan', 'kode' => 'PMH', 'uraian' => 'Surat permohonan bantuan atau izin'],
            ['nama' => 'Surat Keterangan', 'kode' => 'SKT', 'uraian' => 'Surat keterangan untuk siswa atau guru'],
            ['nama' => 'Pengumuman', 'kode' => 'PGM', 'uraian' => 'Pengumuman resmi sekolah'],
            ['nama' => 'Berita Acara', 'kode' => 'BA', 'uraian' => 'Catatan resmi hasil rapat atau kegiatan'],
            ['nama' => 'Surat Perjanjian', 'kode' => 'SPJ', 'uraian' => 'Perjanjian kerjasama dengan pihak lain'],
            ['nama' => 'Proposal', 'kode' => 'PPL', 'uraian' => 'Proposal kegiatan atau program sekolah'],
            ['nama' => 'Konfirmasi', 'kode' => 'KNF', 'uraian' => 'Surat konfirmasi kehadiran atau persetujuan'],
            ['nama' => 'Rekomendasi', 'kode' => 'RKM', 'uraian' => 'Surat rekomendasi untuk siswa atau guru'],
        ];

        foreach ($refJenisNaskahData as $data) {
            RefJenisNaskah::create($data);
        }
    }
}
