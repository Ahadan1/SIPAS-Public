<?php

namespace Database\Seeders;

use App\Models\Kegiatan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class KegiatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Kegiatan::truncate();
        Schema::enableForeignKeyConstraints();

        $kegiatanData = [
            [
                'nama_kegiatan' => 'Upacara Hari Kemerdekaan RI ke-79',
                'tanggal_kegiatan' => '2024-08-17',
                'kode_uk' => 'KSW',
                'keterangan' => 'Upacara bendera memperingati Hari Kemerdekaan Republik Indonesia yang ke-79 dengan tema "Indonesia Maju".',
                'youtube_link' => 'https://www.youtube.com/watch?v=kemerdekaan79',
            ],
            [
                'nama_kegiatan' => 'Workshop Kurikulum Merdeka untuk Guru',
                'tanggal_kegiatan' => '2024-08-20',
                'kode_uk' => 'AKD',
                'keterangan' => 'Pelatihan implementasi kurikulum merdeka bagi seluruh guru mata pelajaran dengan narasumber dari Kemendikbud.',
                'youtube_link' => null,
            ],
            [
                'nama_kegiatan' => 'Olimpiade Sains Nasional Tingkat Sekolah',
                'tanggal_kegiatan' => '2024-08-25',
                'kode_uk' => 'AKD',
                'keterangan' => 'Seleksi internal untuk menentukan perwakilan sekolah dalam OSN tingkat kabupaten/kota bidang Matematika, Fisika, Kimia, dan Biologi.',
                'youtube_link' => null,
            ],
            [
                'nama_kegiatan' => 'Bakti Sosial Korban Bencana Alam',
                'tanggal_kegiatan' => '2024-08-30',
                'kode_uk' => 'HUM',
                'keterangan' => 'Kegiatan pengumpulan donasi dan bantuan untuk korban bencana alam di daerah Sukabumi yang melibatkan seluruh warga sekolah.',
                'youtube_link' => 'https://www.youtube.com/watch?v=baktisosial2024',
            ],
            [
                'nama_kegiatan' => 'Pemeriksaan Kesehatan Siswa Kelas X',
                'tanggal_kegiatan' => '2024-09-05',
                'kode_uk' => 'KSW',
                'keterangan' => 'Pemeriksaan kesehatan rutin untuk siswa baru kelas X bekerjasama dengan Puskesmas Kecamatan.',
                'youtube_link' => null,
            ],
            [
                'nama_kegiatan' => 'Pelatihan Kepemimpinan OSIS',
                'tanggal_kegiatan' => '2024-09-10',
                'kode_uk' => 'KSW',
                'keterangan' => 'Program pelatihan kepemimpinan untuk pengurus OSIS periode 2024-2025 dengan tema "Pemimpin Masa Depan".',
                'youtube_link' => null,
            ],
            [
                'nama_kegiatan' => 'Seminar Motivasi "Meraih Cita-cita"',
                'tanggal_kegiatan' => '2024-09-15',
                'kode_uk' => 'KSW',
                'keterangan' => 'Seminar motivasi untuk siswa kelas XII dalam menghadapi ujian akhir dan persiapan melanjutkan ke perguruan tinggi.',
                'youtube_link' => 'https://www.youtube.com/watch?v=seminarmotivasi2024',
            ],
            [
                'nama_kegiatan' => 'Festival Seni dan Budaya Sekolah',
                'tanggal_kegiatan' => '2024-09-20',
                'kode_uk' => 'KSW',
                'keterangan' => 'Pentas seni tahunan yang menampilkan berbagai kreativitas siswa dalam bidang musik, tari, teater, dan seni rupa.',
                'youtube_link' => 'https://www.youtube.com/watch?v=festivalseni2024',
            ],
            [
                'nama_kegiatan' => 'Sosialisasi Bahaya Narkoba',
                'tanggal_kegiatan' => '2024-09-25',
                'kode_uk' => 'KSW',
                'keterangan' => 'Program sosialisasi bahaya narkoba bekerjasama dengan BNN dan Polsek setempat untuk seluruh siswa.',
                'youtube_link' => null,
            ],
            [
                'nama_kegiatan' => 'Study Tour Kelas XI ke Museum Nasional',
                'tanggal_kegiatan' => '2024-10-01',
                'kode_uk' => 'AKD',
                'keterangan' => 'Kunjungan edukatif siswa kelas XI ke Museum Nasional Jakarta dalam rangka pembelajaran sejarah dan budaya Indonesia.',
                'youtube_link' => null,
            ],
        ];

        foreach ($kegiatanData as $index => $data) {
            Kegiatan::create([
                'nama_kegiatan' => $data['nama_kegiatan'],
                'tanggal_kegiatan' => $data['tanggal_kegiatan'],
                'kode_uk' => $data['kode_uk'],
                'keterangan' => $data['keterangan'],
                'youtube_link' => $data['youtube_link'],
                'main_file' => 'documents/kegiatan/kegiatan_' . str_pad($index + 1, 3, '0', STR_PAD_LEFT) . '.pdf',
                'created_by' => rand(2, 8), // Random school staff
                'updated_by' => rand(2, 8),
            ]);
        }
    }
}
