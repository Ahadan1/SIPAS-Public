<?php

namespace Database\Seeders;

use App\Models\Tujuan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class TujuanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Tujuan::truncate();
        Schema::enableForeignKeyConstraints();

        $tujuanData = [
            [
                'id_surat' => 1,
                'nama_tujuan' => 'Dinas Pendidikan DKI Jakarta',
                'alamat' => 'Jl. Gatot Subroto Kav. 40-41, Jakarta Selatan',
                'jenis_tujuan' => 'Instansi Pemerintah',
                'keterangan' => 'Laporan kegiatan sekolah'
            ],
            [
                'id_surat' => 2,
                'nama_tujuan' => 'Universitas Indonesia',
                'alamat' => 'Kampus UI Depok, Jawa Barat',
                'jenis_tujuan' => 'Perguruan Tinggi',
                'keterangan' => 'Kerjasama program magang siswa'
            ],
            [
                'id_surat' => 3,
                'nama_tujuan' => 'SMA Negeri 5 Jakarta',
                'alamat' => 'Jl. Melawai Raya No. 15, Jakarta Selatan',
                'jenis_tujuan' => 'Sekolah',
                'keterangan' => 'Undangan lomba antar sekolah'
            ],
            [
                'id_surat' => 4,
                'nama_tujuan' => 'Komite Sekolah SMA Negeri 1',
                'alamat' => 'SMA Negeri 1 Jakarta',
                'jenis_tujuan' => 'Komite Sekolah',
                'keterangan' => 'Rapat evaluasi program sekolah'
            ],
            [
                'id_surat' => 5,
                'nama_tujuan' => 'Orang Tua/Wali Siswa',
                'alamat' => 'Masing-masing alamat',
                'jenis_tujuan' => 'Orang Tua',
                'keterangan' => 'Pemberitahuan kegiatan sekolah'
            ],
            [
                'id_surat' => 6,
                'nama_tujuan' => 'PT. Teknologi Pendidikan Indonesia',
                'alamat' => 'Jl. Sudirman No. 123, Jakarta Pusat',
                'jenis_tujuan' => 'Vendor',
                'keterangan' => 'Pengadaan perangkat komputer'
            ],
            [
                'id_surat' => 7,
                'nama_tujuan' => 'Media Pendidikan TV',
                'alamat' => 'Jl. Media No. 45, Jakarta Barat',
                'jenis_tujuan' => 'Media',
                'keterangan' => 'Liputan prestasi siswa'
            ],
            [
                'id_surat' => 8,
                'nama_tujuan' => 'Alumni SMA Negeri 1 Jakarta',
                'alamat' => 'Sekretariat Alumni',
                'jenis_tujuan' => 'Alumni',
                'keterangan' => 'Undangan reuni dan bakti sosial'
            ],
        ];

        foreach ($tujuanData as $data) {
            Tujuan::create($data);
        }
    }
}
