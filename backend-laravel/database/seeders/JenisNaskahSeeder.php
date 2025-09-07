<?php

namespace Database\Seeders;

use App\Models\JenisNaskah;
use Illuminate\Database\Seeder;

class JenisNaskahSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        JenisNaskah::create(['nama_jenis' => 'Surat Keputusan', 'deskripsi' => 'Naskah dinas berisi penetapan yang bersifat final dan mengikat.']);
        JenisNaskah::create(['nama_jenis' => 'Surat Edaran', 'deskripsi' => 'Naskah dinas berisi pemberitahuan atau penjelasan kepada pihak tertentu.']);
        JenisNaskah::create(['nama_jenis' => 'Surat Tugas', 'deskripsi' => 'Naskah dinas yang memberikan tugas atau wewenang kepada seseorang.']);
        JenisNaskah::create(['nama_jenis' => 'Prosedur Operasional Baku', 'deskripsi' => 'Naskah berisi langkah-langkah standar dalam suatu proses.']);
        JenisNaskah::create(['nama_jenis' => 'Nota Dinas', 'deskripsi' => 'Naskah dinas yang berisi informasi atau laporan singkat.']);
        JenisNaskah::create(['nama_jenis' => 'Surat Dinas', 'deskripsi' => 'Naskah resmi yang digunakan untuk komunikasi antar instansi.']);
        JenisNaskah::create(['nama_jenis' => 'Nota Kesepakatan Bersama', 'deskripsi' => 'Naskah yang berisi kesepakatan antara dua pihak atau lebih.']);
        JenisNaskah::create(['nama_jenis' => 'Surat Perjanjian', 'deskripsi' => 'Naskah yang mengikat secara hukum antara dua pihak.']);
        JenisNaskah::create(['nama_jenis' => 'Surat Kuasa', 'deskripsi' => 'Naskah yang memberikan wewenang kepada seseorang untuk bertindak atas nama orang lain.']);
        JenisNaskah::create(['nama_jenis' => 'Pendelegasian', 'deskripsi' => 'Naskah yang berisi penyerahan wewenang dari satu pihak ke pihak lain.']);
        JenisNaskah::create(['nama_jenis' => 'Berita Acara', 'deskripsi' => 'Naskah yang berisi catatan resmi mengenai suatu peristiwa atau kegiatan.']);
        JenisNaskah::create(['nama_jenis' => 'Pengumuman', 'deskripsi' => 'Naskah yang berisi informasi penting yang disampaikan kepada publik.']);
        JenisNaskah::create(['nama_jenis' => 'Pernyataan', 'deskripsi' => 'Naskah yang berisi pernyataan resmi dari seseorang atau instansi.']);
        JenisNaskah::create(['nama_jenis' => 'Surat Keterangan', 'deskripsi' => 'Naskah yang berisi keterangan resmi mengenai suatu hal.']);
        JenisNaskah::create(['nama_jenis' => 'Sertifikat', 'deskripsi' => 'Naskah yang berisi pengakuan resmi atas suatu prestasi atau kondisi.']);
        JenisNaskah::create(['nama_jenis' => 'Peraturan', 'deskripsi' => 'Naskah yang berisi ketentuan atau aturan yang harus diikuti.']);
        JenisNaskah::create(['nama_jenis' => 'Surat Rekomendasi', 'deskripsi' => 'Naskah yang berisi rekomendasi atau saran dari pihak tertentu.']);
    }
}
