<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\SuratMasuk;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class SuratMasukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        SuratMasuk::truncate();
        Document::where('id', '<=', 20)->delete(); // Clean up first 20 documents for this seeder
        Schema::enableForeignKeyConstraints();

        $suratMasukData = [
            [
                'nomor_surat' => '001/DISDIK/VIII/2024',
                'perihal' => 'Undangan Rapat Koordinasi Kepala Sekolah',
                'tanggal_surat' => now()->subDays(7),
                'asal_surat' => 'Dinas Pendidikan Kota',
                'tanggal_diterima' => now()->subDays(6),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Segera',
                'ringkasan' => 'Undangan menghadiri rapat koordinasi kepala sekolah se-kota membahas kurikulum merdeka.',
                'penerima_id' => 2, // Kepala Sekolah
                'klasifikasi_id' => 2, // Akademik
                'jenis_naskah_id' => 2, // Surat Edaran
            ],
            [
                'nomor_surat' => '045/KEMENDIKBUD/VIII/2024',
                'perihal' => 'Petunjuk Teknis Pelaksanaan Asesmen Nasional 2024',
                'tanggal_surat' => now()->subDays(10),
                'asal_surat' => 'Kementerian Pendidikan dan Kebudayaan',
                'tanggal_diterima' => now()->subDays(9),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Biasa',
                'ringkasan' => 'Petunjuk teknis dan jadwal pelaksanaan Asesmen Nasional untuk tahun 2024.',
                'penerima_id' => 2, // Kepala Sekolah
                'klasifikasi_id' => 2, // Akademik
                'jenis_naskah_id' => 4, // Prosedur Operasional Baku
            ],
            [
                'nomor_surat' => '123/KOMITE/VIII/2024',
                'perihal' => 'Proposal Kegiatan Bakti Sosial Sekolah',
                'tanggal_surat' => now()->subDays(5),
                'asal_surat' => 'Komite Sekolah',
                'tanggal_diterima' => now()->subDays(4),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Biasa',
                'ringkasan' => 'Proposal kegiatan bakti sosial untuk membantu korban bencana alam di daerah sekitar.',
                'penerima_id' => 2, // Kepala Sekolah
                'klasifikasi_id' => 4, // Humas dan Kerjasama
                'jenis_naskah_id' => 8, // Surat Perjanjian
            ],
            [
                'nomor_surat' => '078/ORTU/VIII/2024',
                'perihal' => 'Permohonan Izin Siswa Mengikuti Kompetisi Nasional',
                'tanggal_surat' => now()->subDays(3),
                'asal_surat' => 'Orang Tua Siswa - Budi Santoso',
                'tanggal_diterima' => now()->subDays(2),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Segera',
                'ringkasan' => 'Permohonan izin untuk siswa Andi Santoso kelas XI IPA mengikuti Olimpiade Matematika Nasional.',
                'penerima_id' => 6, // Wakil Kepala Kesiswaan
                'klasifikasi_id' => 2, // Akademik
                'jenis_naskah_id' => 6, // Surat Dinas
            ],
            [
                'nomor_surat' => '234/UNIV/VIII/2024',
                'perihal' => 'Undangan Kerjasama Program Dual Degree',
                'tanggal_surat' => now()->subDays(8),
                'asal_surat' => 'Universitas Indonesia',
                'tanggal_diterima' => now()->subDays(7),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Biasa',
                'ringkasan' => 'Undangan kerjasama program dual degree untuk siswa berprestasi tinggi.',
                'penerima_id' => 2, // Kepala Sekolah
                'klasifikasi_id' => 4, // Humas dan Kerjasama
                'jenis_naskah_id' => 7, // Nota Kesepakatan Bersama
            ],
            [
                'nomor_surat' => '567/VENDOR/VIII/2024',
                'perihal' => 'Penawaran Buku Paket Kurikulum Merdeka',
                'tanggal_surat' => now()->subDays(4),
                'asal_surat' => 'PT. Penerbit Pendidikan Nusantara',
                'tanggal_diterima' => now()->subDays(3),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Biasa',
                'ringkasan' => 'Penawaran harga dan katalog buku paket untuk implementasi kurikulum merdeka.',
                'penerima_id' => 4, // Kepala Tata Usaha
                'klasifikasi_id' => 1, // Keuangan
                'jenis_naskah_id' => 6, // Surat Dinas
            ],
            [
                'nomor_surat' => '890/POLSEK/VIII/2024',
                'perihal' => 'Sosialisasi Keamanan Sekolah dan Pencegahan Bullying',
                'tanggal_surat' => now()->subDays(6),
                'asal_surat' => 'Polsek Setempat',
                'tanggal_diterima' => now()->subDays(5),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Biasa',
                'ringkasan' => 'Program sosialisasi keamanan sekolah dan pencegahan bullying untuk siswa dan guru.',
                'penerima_id' => 6, // Wakil Kepala Kesiswaan
                'klasifikasi_id' => 4, // Humas dan Kerjasama
                'jenis_naskah_id' => 2, // Surat Edaran
            ],
            [
                'nomor_surat' => '345/ALUMNI/VIII/2024',
                'perihal' => 'Proposal Beasiswa Alumni Berprestasi',
                'tanggal_surat' => now()->subDays(9),
                'asal_surat' => 'Ikatan Alumni SMA Negeri 1',
                'tanggal_diterima' => now()->subDays(8),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Biasa',
                'ringkasan' => 'Proposal program beasiswa dari alumni untuk siswa berprestasi namun kurang mampu.',
                'penerima_id' => 2, // Kepala Sekolah
                'klasifikasi_id' => 3, // SDM
                'jenis_naskah_id' => 8, // Surat Perjanjian
            ],
            [
                'nomor_surat' => '678/PUSKESMAS/VIII/2024',
                'perihal' => 'Jadwal Pemeriksaan Kesehatan Siswa',
                'tanggal_surat' => now()->subDays(2),
                'asal_surat' => 'Puskesmas Kecamatan',
                'tanggal_diterima' => now()->subDays(1),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Segera',
                'ringkasan' => 'Jadwal pemeriksaan kesehatan rutin untuk seluruh siswa kelas X.',
                'penerima_id' => 6, // Wakil Kepala Kesiswaan
                'klasifikasi_id' => 4, // Humas dan Kerjasama
                'jenis_naskah_id' => 5, // Nota Dinas
            ],
            [
                'nomor_surat' => '999/MEDIA/VIII/2024',
                'perihal' => 'Permintaan Wawancara Prestasi Sekolah',
                'tanggal_surat' => now()->subDays(1),
                'asal_surat' => 'Harian Kompas',
                'tanggal_diterima' => now(),
                'sifat_keamanan' => 'Biasa',
                'sifat_kecepatan' => 'Segera',
                'ringkasan' => 'Permintaan wawancara terkait prestasi sekolah dalam kompetisi sains nasional.',
                'penerima_id' => 8, // Wakil Kepala Humas
                'klasifikasi_id' => 4, // Humas dan Kerjasama
                'jenis_naskah_id' => 6, // Surat Dinas
            ],
        ];

        foreach ($suratMasukData as $index => $data) {
            // Create document first
            $document = Document::create([
                'klasifikasi_id' => $data['klasifikasi_id'],
                'jenis_naskah_id' => $data['jenis_naskah_id'],
                'user_id' => $data['penerima_id'],
                'nomor_surat' => $data['nomor_surat'],
                'tanggal_surat' => $data['tanggal_surat'],
                'perihal' => $data['perihal'],
                'sifat_keamanan' => $data['sifat_keamanan'],
                'sifat_kecepatan' => $data['sifat_kecepatan'],
                'ringkasan' => $data['ringkasan'],
                'file_path' => 'documents/surat_masuk/surat_masuk_' . str_pad($index + 1, 3, '0', STR_PAD_LEFT) . '.pdf',
            ]);

            // Create incoming mail record
            SuratMasuk::create([
                'document_id' => $document->id,
                'penerima_id' => $data['penerima_id'],
                'asal_surat' => $data['asal_surat'],
                'tanggal_diterima' => $data['tanggal_diterima'],
                'status' => rand(0, 1) ? 'Diterima' : 'Diproses',
            ]);
        }
    }
}
