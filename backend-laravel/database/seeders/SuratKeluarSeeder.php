<?php

namespace Database\Seeders;

use App\Models\SuratKeluar;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class SuratKeluarSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        SuratKeluar::truncate();
        Schema::enableForeignKeyConstraints();

        $suratKeluarData = [
            [
                'perihal' => 'Laporan Pelaksanaan Asesmen Nasional 2024',
                'tujuan' => 'Dinas Pendidikan Kota',
                'kode_jenis' => 'LPR',
                'kode_klasifikasi' => 'AK',
                'kode_penandatanganan' => 'KS',
                'tgl_surat' => now()->subDays(2),
                'kode_uk' => 'AKD',
                'drafsurat' => 'Dengan hormat, bersama ini kami sampaikan laporan pelaksanaan Asesmen Nasional tahun 2024 di SMA Negeri 1...',
                'ref_surat_masuk' => 2, // Reference to Kemendikbud letter
            ],
            [
                'perihal' => 'Undangan Rapat Orang Tua Siswa Kelas XII',
                'tujuan' => 'Orang Tua/Wali Siswa Kelas XII',
                'kode_jenis' => 'UND',
                'kode_klasifikasi' => 'AK',
                'kode_penandatanganan' => 'KS',
                'tgl_surat' => now()->subDays(5),
                'kode_uk' => 'KSW',
                'drafsurat' => 'Dengan hormat, dalam rangka persiapan ujian akhir dan kelulusan siswa kelas XII, kami mengundang Bapak/Ibu...',
                'ref_surat_masuk' => null,
            ],
            [
                'perihal' => 'Permohonan Kerjasama Program Magang Siswa',
                'tujuan' => 'PT. Teknologi Nusantara',
                'kode_jenis' => 'PMH',
                'kode_klasifikasi' => 'HM',
                'kode_penandatanganan' => 'KS',
                'tgl_surat' => now()->subDays(7),
                'kode_uk' => 'HUM',
                'drafsurat' => 'Dengan hormat, dalam rangka meningkatkan kompetensi siswa melalui pengalaman praktis di dunia kerja...',
                'ref_surat_masuk' => null,
            ],
            [
                'perihal' => 'Surat Keterangan Siswa Berprestasi',
                'tujuan' => 'Universitas Indonesia',
                'kode_jenis' => 'SKT',
                'kode_klasifikasi' => 'AK',
                'kode_penandatanganan' => 'KS',
                'tgl_surat' => now()->subDays(3),
                'kode_uk' => 'AKD',
                'drafsurat' => 'Dengan ini menerangkan bahwa siswa atas nama Andi Santoso telah meraih prestasi Juara 1 Olimpiade Matematika...',
                'ref_surat_masuk' => 4, // Reference to parent permission letter
            ],
            [
                'perihal' => 'Laporan Kegiatan Bakti Sosial Sekolah',
                'tujuan' => 'Komite Sekolah',
                'kode_jenis' => 'LPR',
                'kode_klasifikasi' => 'HM',
                'kode_penandatanganan' => 'KS',
                'tgl_surat' => now()->subDays(1),
                'kode_uk' => 'HUM',
                'drafsurat' => 'Dengan hormat, bersama ini kami sampaikan laporan pelaksanaan kegiatan bakti sosial yang telah dilaksanakan...',
                'ref_surat_masuk' => 3, // Reference to committee proposal
            ],
            [
                'perihal' => 'Permohonan Bantuan Fasilitas Laboratorium',
                'tujuan' => 'Dinas Pendidikan Provinsi',
                'kode_jenis' => 'PMH',
                'kode_klasifikasi' => 'KU',
                'kode_penandatanganan' => 'KS',
                'tgl_surat' => now()->subDays(8),
                'kode_uk' => 'SPR',
                'drafsurat' => 'Dengan hormat, dalam rangka meningkatkan kualitas pembelajaran IPA, kami bermohon bantuan fasilitas laboratorium...',
                'ref_surat_masuk' => null,
            ],
            [
                'perihal' => 'Konfirmasi Kehadiran Rapat Koordinasi',
                'tujuan' => 'Dinas Pendidikan Kota',
                'kode_jenis' => 'KNF',
                'kode_klasifikasi' => 'AK',
                'kode_penandatanganan' => 'KS',
                'tgl_surat' => now()->subDays(6),
                'kode_uk' => 'AKD',
                'drafsurat' => 'Dengan hormat, menanggapi surat undangan rapat koordinasi kepala sekolah, dengan ini kami konfirmasi kehadiran...',
                'ref_surat_masuk' => 1, // Reference to meeting invitation
            ],
            [
                'perihal' => 'Pengajuan Proposal Kegiatan Study Tour',
                'tujuan' => 'Komite Sekolah',
                'kode_jenis' => 'PPL',
                'kode_klasifikasi' => 'AK',
                'kode_penandatanganan' => 'KS',
                'tgl_surat' => now()->subDays(4),
                'kode_uk' => 'KSW',
                'drafsurat' => 'Dengan hormat, dalam rangka menambah wawasan dan pengalaman siswa kelas XI, kami mengajukan proposal study tour...',
                'ref_surat_masuk' => null,
            ],
        ];

        foreach ($suratKeluarData as $index => $data) {
            // Generate nomor surat automatically
            $tahun = date('Y');
            $bulan = date('m');
            $nomorUrut = str_pad($index + 1, 3, '0', STR_PAD_LEFT);
            $nomorSurat = "{$nomorUrut}/{$data['kode_jenis']}/{$data['kode_klasifikasi']}.{$data['kode_uk']}/{$bulan}/{$tahun}";

            SuratKeluar::create([
                'nomor_surat' => $nomorSurat,
                'perihal' => $data['perihal'],
                'tujuan' => $data['tujuan'],
                'kode_jenis' => $data['kode_jenis'],
                'kode_klasifikasi' => $data['kode_klasifikasi'],
                'kode_penandatanganan' => $data['kode_penandatanganan'],
                'tgl_surat' => $data['tgl_surat'],
                'file_path' => 'documents/surat_keluar/surat_keluar_' . str_pad($index + 1, 3, '0', STR_PAD_LEFT) . '.pdf',
                'kode_uk' => $data['kode_uk'],
                'drafsurat' => $data['drafsurat'],
                'ref_surat_masuk' => $data['ref_surat_masuk'],
                'status' => rand(0, 2) == 0 ? 'Draft' : (rand(0, 1) ? 'Dikirim' : 'Diarsipkan'),
                'created_by' => 2, // Kepala Sekolah
                'updated_by' => 2,
            ]);
        }
    }
}
