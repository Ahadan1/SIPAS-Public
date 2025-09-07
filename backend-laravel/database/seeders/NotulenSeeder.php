<?php

namespace Database\Seeders;

use App\Models\Notulen;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class NotulenSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Notulen::truncate();
        Schema::enableForeignKeyConstraints();

        $notulenData = [
            [
                'nama_kegiatan' => 'Rapat Koordinasi Kepala Sekolah dan Wakil Kepala',
                'tanggal_kegiatan' => now()->subDays(5),
                'keterangan' => 'Pembahasan program kerja semester genap dan evaluasi pelaksanaan kurikulum merdeka. Dihadiri oleh kepala sekolah, wakil kepala, dan koordinator mata pelajaran.',
            ],
            [
                'nama_kegiatan' => 'Rapat Dewan Guru Bulanan',
                'tanggal_kegiatan' => now()->subDays(10),
                'keterangan' => 'Evaluasi perkembangan siswa, pembahasan metode pembelajaran, dan koordinasi kegiatan ekstrakurikuler. Membahas persiapan ujian tengah semester.',
            ],
            [
                'nama_kegiatan' => 'Rapat Komite Sekolah',
                'tanggal_kegiatan' => now()->subDays(15),
                'keterangan' => 'Pembahasan anggaran sekolah, program pengembangan fasilitas, dan rencana kegiatan bakti sosial. Dihadiri komite sekolah dan perwakilan orang tua.',
            ],
            [
                'nama_kegiatan' => 'Rapat Persiapan Ujian Akhir Semester',
                'tanggal_kegiatan' => now()->subDays(20),
                'keterangan' => 'Koordinasi jadwal ujian, pembagian tugas pengawas, dan persiapan teknis pelaksanaan ujian. Membahas protokol kesehatan selama ujian.',
            ],
            [
                'nama_kegiatan' => 'Rapat Evaluasi Program OSIS',
                'tanggal_kegiatan' => now()->subDays(7),
                'keterangan' => 'Evaluasi program kerja OSIS semester ini dan perencanaan kegiatan semester depan. Pembahasan festival seni dan lomba antar kelas.',
            ],
            [
                'nama_kegiatan' => 'Rapat Koordinasi Bimbingan Konseling',
                'tanggal_kegiatan' => now()->subDays(12),
                'keterangan' => 'Pembahasan kasus siswa bermasalah, program bimbingan karir untuk kelas XII, dan sosialisasi kesehatan mental remaja.',
            ],
            [
                'nama_kegiatan' => 'Rapat Persiapan Akreditasi Sekolah',
                'tanggal_kegiatan' => now()->subDays(25),
                'keterangan' => 'Persiapan dokumen akreditasi, pembagian tugas tim akreditasi, dan evaluasi standar nasional pendidikan. Timeline persiapan hingga visitasi.',
            ],
            [
                'nama_kegiatan' => 'Rapat Koordinasi Keamanan Sekolah',
                'tanggal_kegiatan' => now()->subDays(8),
                'keterangan' => 'Evaluasi sistem keamanan sekolah, pembahasan protokol keadaan darurat, dan koordinasi dengan pihak kepolisian setempat.',
            ],
        ];

        foreach ($notulenData as $index => $data) {
            Notulen::create([
                'nama_kegiatan' => $data['nama_kegiatan'],
                'tanggal_kegiatan' => $data['tanggal_kegiatan'],
                'keterangan' => $data['keterangan'],
                'file_path' => 'documents/notulen/notulen_' . str_pad($index + 1, 3, '0', STR_PAD_LEFT) . '.pdf',
                'audio_path' => rand(0, 1) ? 'documents/notulen/audio_' . str_pad($index + 1, 3, '0', STR_PAD_LEFT) . '.mp3' : null,
                'created_by' => rand(2, 4), // Random leadership staff
                'updated_by' => rand(2, 4),
            ]);
        }
    }
}
