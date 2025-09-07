<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JabatanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $now = now();
        $rows = [
            // System Administration
            ['nama_jabatan' => 'Admin', 'kode_uk' => 'ADM', 'level_hierarki' => 0],
            
            // School Leadership
            ['nama_jabatan' => 'Kepala Sekolah', 'kode_uk' => 'KS', 'level_hierarki' => 1],
            ['nama_jabatan' => 'Wakil Kepala Sekolah', 'kode_uk' => 'WKS', 'level_hierarki' => 2],
            
            // Department Heads
            ['nama_jabatan' => 'Kepala Tata Usaha', 'kode_uk' => 'KTU', 'level_hierarki' => 3],
            ['nama_jabatan' => 'Wakil Kepala Kurikulum', 'kode_uk' => 'WKK', 'level_hierarki' => 3],
            ['nama_jabatan' => 'Wakil Kepala Kesiswaan', 'kode_uk' => 'WKS', 'level_hierarki' => 3],
            ['nama_jabatan' => 'Wakil Kepala Sarana Prasarana', 'kode_uk' => 'WKSP', 'level_hierarki' => 3],
            ['nama_jabatan' => 'Wakil Kepala Humas', 'kode_uk' => 'WKH', 'level_hierarki' => 3],
            
            // Coordinators
            ['nama_jabatan' => 'Koordinator BK', 'kode_uk' => 'KBK', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Koordinator Perpustakaan', 'kode_uk' => 'KPUS', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Koordinator Laboratorium', 'kode_uk' => 'KLAB', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Koordinator Keuangan', 'kode_uk' => 'KKU', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Koordinator Keamanan', 'kode_uk' => 'KKAM', 'level_hierarki' => 4],
            
            // Subject Area Heads
            ['nama_jabatan' => 'Kepala Mata Pelajaran Matematika', 'kode_uk' => 'KMTK', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Kepala Mata Pelajaran IPA', 'kode_uk' => 'KIPA', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Kepala Mata Pelajaran IPS', 'kode_uk' => 'KIPS', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Kepala Mata Pelajaran Bahasa', 'kode_uk' => 'KBH', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Kepala Mata Pelajaran Agama', 'kode_uk' => 'KAG', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Kepala Mata Pelajaran Olahraga', 'kode_uk' => 'KOR', 'level_hierarki' => 4],
            ['nama_jabatan' => 'Kepala Mata Pelajaran Seni', 'kode_uk' => 'KSN', 'level_hierarki' => 4],
            
            // Teachers
            ['nama_jabatan' => 'Guru Matematika', 'kode_uk' => 'GMTK', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Fisika', 'kode_uk' => 'GFIS', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Kimia', 'kode_uk' => 'GKIM', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Biologi', 'kode_uk' => 'GBIO', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Bahasa Indonesia', 'kode_uk' => 'GBID', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Bahasa Inggris', 'kode_uk' => 'GBIG', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Sejarah', 'kode_uk' => 'GSEJ', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Geografi', 'kode_uk' => 'GGEO', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Ekonomi', 'kode_uk' => 'GEKO', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Sosiologi', 'kode_uk' => 'GSOS', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Agama Islam', 'kode_uk' => 'GAIS', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Agama Kristen', 'kode_uk' => 'GAKR', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Agama Katolik', 'kode_uk' => 'GAKT', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Agama Hindu', 'kode_uk' => 'GAHN', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Agama Buddha', 'kode_uk' => 'GABD', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru PJOK', 'kode_uk' => 'GPJK', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru Seni Budaya', 'kode_uk' => 'GSB', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru PKn', 'kode_uk' => 'GPKN', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Guru TIK', 'kode_uk' => 'GTIK', 'level_hierarki' => 5],
            
            // Counseling and Support
            ['nama_jabatan' => 'Guru BK', 'kode_uk' => 'GBK', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Psikolog Sekolah', 'kode_uk' => 'PSI', 'level_hierarki' => 5],
            
            // Administrative Staff
            ['nama_jabatan' => 'Staff Administrasi', 'kode_uk' => 'STAD', 'level_hierarki' => 6],
            ['nama_jabatan' => 'Staff Keuangan', 'kode_uk' => 'STKU', 'level_hierarki' => 6],
            ['nama_jabatan' => 'Staff Perpustakaan', 'kode_uk' => 'STPU', 'level_hierarki' => 6],
            ['nama_jabatan' => 'Staff Laboratorium', 'kode_uk' => 'STLA', 'level_hierarki' => 6],
            ['nama_jabatan' => 'Staff Keamanan', 'kode_uk' => 'STKA', 'level_hierarki' => 6],
            ['nama_jabatan' => 'Staff Kebersihan', 'kode_uk' => 'STKB', 'level_hierarki' => 6],
            ['nama_jabatan' => 'Staff IT', 'kode_uk' => 'STIT', 'level_hierarki' => 6],
            
            // Class Management
            ['nama_jabatan' => 'Wali Kelas X', 'kode_uk' => 'WK10', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Wali Kelas XI', 'kode_uk' => 'WK11', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Wali Kelas XII', 'kode_uk' => 'WK12', 'level_hierarki' => 5],
            
            // Student Organizations
            ['nama_jabatan' => 'Pembina OSIS', 'kode_uk' => 'POSIS', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Pembina Pramuka', 'kode_uk' => 'PPRAM', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Pembina PMR', 'kode_uk' => 'PPMR', 'level_hierarki' => 5],
            ['nama_jabatan' => 'Pembina Rohis', 'kode_uk' => 'PROH', 'level_hierarki' => 5],
        ];

        foreach ($rows as $row) {
            DB::table('jabatan')->updateOrInsert(
                ['kode_uk' => $row['kode_uk']],
                [
                    'nama_jabatan' => $row['nama_jabatan'],
                    'level_hierarki' => $row['level_hierarki'],
                    'deskripsi' => $row['deskripsi'] ?? null,
                    'is_active' => $row['is_active'] ?? 1,
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }
    }
}
