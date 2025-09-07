<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            // Reference data first (no dependencies)
            RefJenisNaskahSeeder::class,
            RefKlasifikasiSeeder::class,
            RefDisposisiSeeder::class,
            RefPenandatangananSeeder::class,
            RefTujuanSeeder::class,
            RefJabatanSeeder::class,
            
            // Core data (depends on reference data)
            KlasifikasiSeeder::class,
            JenisNaskahSeeder::class,
            JabatanSeeder::class,
            
            // Users (depends on jabatan)
            UserSeeder::class,
            
            // Documents and correspondence (depends on users, klasifikasi, jenis_naskah)
            SuratMasukSeeder::class,
            SuratKeluarSeeder::class,
            DisposisiSeeder::class,
            
            // Monitoring and tracking (depends on surat_masuk)
            LembarPantauSeeder::class,
            
            // Activities and meetings
            KegiatanSeeder::class,
            NotulenSeeder::class,
            
            // Reports and summaries
            SuratRekapSeeder::class,
            
            // Related correspondence data (depends on surat)
            TembusanSeeder::class,
            TujuanSeeder::class,
        ]);
    }
}
