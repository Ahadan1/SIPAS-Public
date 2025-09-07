<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        User::truncate();
        Schema::enableForeignKeyConstraints();

        $users = [
            // Administrative Leadership
            [
                'username' => 'kepala_sekolah',
                'email' => 'kepala@sekolah.sch.id',
                'password' => Hash::make('admin123'),
                'nama' => 'Dr. Ahmad Suryanto, M.Pd',
                'jabatan_id' => 2, // Direktur equivalent
                'is_active' => true,
            ],
            [
                'username' => 'wakil_kepala',
                'email' => 'wakil@sekolah.sch.id',
                'password' => Hash::make('admin123'),
                'nama' => 'Dra. Siti Nurhaliza, M.M',
                'jabatan_id' => 3, // Wakil Direktur equivalent
                'is_active' => true,
            ],
            
            // Department Heads
            [
                'username' => 'kepala_tata_usaha',
                'email' => 'tata.usaha@sekolah.sch.id',
                'password' => Hash::make('admin123'),
                'nama' => 'Bambang Wijaya, S.Pd',
                'jabatan_id' => 4, // Kepala BAS equivalent
                'is_active' => true,
            ],
            [
                'username' => 'kepala_kurikulum',
                'email' => 'kurikulum@sekolah.sch.id',
                'password' => Hash::make('admin123'),
                'nama' => 'Indira Sari, M.Pd',
                'jabatan_id' => 22, // Koord. PPF equivalent
                'is_active' => true,
            ],
            [
                'username' => 'kepala_kesiswaan',
                'email' => 'kesiswaan@sekolah.sch.id',
                'password' => Hash::make('admin123'),
                'nama' => 'Rudi Hartono, S.Pd',
                'jabatan_id' => 23, // Koord. PPK equivalent
                'is_active' => true,
            ],
            
            // Teachers
            [
                'username' => 'guru_matematika',
                'email' => 'matematika@sekolah.sch.id',
                'password' => Hash::make('guru123'),
                'nama' => 'Prof. Dr. Widodo Santoso',
                'jabatan_id' => 27, // Drafter level
                'is_active' => true,
            ],
            [
                'username' => 'guru_bahasa',
                'email' => 'bahasa@sekolah.sch.id',
                'password' => Hash::make('guru123'),
                'nama' => 'Dewi Kartika, M.Pd',
                'jabatan_id' => 28, // Drafter level
                'is_active' => true,
            ],
            [
                'username' => 'guru_ipa',
                'email' => 'ipa@sekolah.sch.id',
                'password' => Hash::make('guru123'),
                'nama' => 'Dr. Budi Prasetyo, M.Si',
                'jabatan_id' => 29, // Drafter level
                'is_active' => true,
            ],
            [
                'username' => 'guru_ips',
                'email' => 'ips@sekolah.sch.id',
                'password' => Hash::make('guru123'),
                'nama' => 'Rina Melati, S.Pd',
                'jabatan_id' => 30, // Drafter level
                'is_active' => true,
            ],
            
            // Administrative Staff
            [
                'username' => 'staff_administrasi',
                'email' => 'admin@sekolah.sch.id',
                'password' => Hash::make('staff123'),
                'nama' => 'Andi Setiawan',
                'jabatan_id' => 31, // Drafter level
                'is_active' => true,
            ],
            [
                'username' => 'staff_keuangan',
                'email' => 'keuangan@sekolah.sch.id',
                'password' => Hash::make('staff123'),
                'nama' => 'Maya Sari, S.E',
                'jabatan_id' => 24, // Koord. Keuangan
                'is_active' => true,
            ],
            [
                'username' => 'staff_perpustakaan',
                'email' => 'perpustakaan@sekolah.sch.id',
                'password' => Hash::make('staff123'),
                'nama' => 'Lestari Wulandari, S.I.Pust',
                'jabatan_id' => 31, // Drafter level
                'is_active' => true,
            ],
            
            // System Administrator
            [
                'username' => 'admin',
                'email' => 'admin@sipas.sch.id',
                'password' => Hash::make('admin123'),
                'nama' => 'System Administrator',
                'jabatan_id' => 1, // Admin
                'is_active' => true,
            ],
            
            // Counseling Staff
            [
                'username' => 'guru_bk',
                'email' => 'bk@sekolah.sch.id',
                'password' => Hash::make('guru123'),
                'nama' => 'Psikolog Ratna Dewi, M.Psi',
                'jabatan_id' => 28, // Drafter level
                'is_active' => true,
            ],
            
            // Support Staff
            [
                'username' => 'staff_lab',
                'email' => 'lab@sekolah.sch.id',
                'password' => Hash::make('staff123'),
                'nama' => 'Teknisi Ahmad Fauzi',
                'jabatan_id' => 31, // Drafter level
                'is_active' => true,
            ],
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
