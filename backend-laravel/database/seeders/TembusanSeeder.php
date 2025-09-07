<?php

namespace Database\Seeders;

use App\Models\Tembusan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class TembusanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        Tembusan::truncate();
        Schema::enableForeignKeyConstraints();

        $tembusanData = [
            [
                'id_surat' => 1,
                'nama_penerima' => 'Dinas Pendidikan Provinsi',
                'jabatan' => 'Kepala Dinas',
                'alamat' => 'Jl. Pendidikan No. 123, Jakarta',
                'keterangan' => 'Untuk diketahui dan ditindaklanjuti'
            ],
            [
                'id_surat' => 1,
                'nama_penerima' => 'Komite Sekolah',
                'jabatan' => 'Ketua Komite',
                'alamat' => 'SMA Negeri 1 Jakarta',
                'keterangan' => 'Untuk koordinasi'
            ],
            [
                'id_surat' => 2,
                'nama_penerima' => 'Kepala Sekolah SMA Negeri 2',
                'jabatan' => 'Kepala Sekolah',
                'alamat' => 'Jl. Merdeka No. 45, Jakarta',
                'keterangan' => 'Untuk informasi'
            ],
            [
                'id_surat' => 3,
                'nama_penerima' => 'Universitas Indonesia',
                'jabatan' => 'Rektor',
                'alamat' => 'Depok, Jawa Barat',
                'keterangan' => 'Untuk kerjasama akademik'
            ],
            [
                'id_surat' => 4,
                'nama_penerima' => 'Orang Tua/Wali Siswa Kelas XII',
                'jabatan' => '-',
                'alamat' => 'Masing-masing alamat',
                'keterangan' => 'Untuk pemberitahuan'
            ],
            [
                'id_surat' => 5,
                'nama_penerima' => 'Puskesmas Kecamatan',
                'jabatan' => 'Kepala Puskesmas',
                'alamat' => 'Jl. Sehat No. 78, Jakarta',
                'keterangan' => 'Untuk koordinasi kesehatan'
            ],
        ];

        foreach ($tembusanData as $data) {
            Tembusan::create($data);
        }
    }
}
