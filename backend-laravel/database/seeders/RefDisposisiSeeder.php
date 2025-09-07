<?php

namespace Database\Seeders;

use App\Models\RefDisposisi;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class RefDisposisiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        RefDisposisi::truncate();
        Schema::enableForeignKeyConstraints();

        $refDisposisiData = [
            ['nama' => 'Untuk ditindaklanjuti'],
            ['nama' => 'Untuk diketahui'],
            ['nama' => 'Untuk dipelajari'],
            ['nama' => 'Untuk dikoordinasikan'],
            ['nama' => 'Untuk dibahas dalam rapat'],
            ['nama' => 'Untuk disiapkan jawaban'],
            ['nama' => 'Untuk diagendakan'],
            ['nama' => 'Untuk diarsipkan'],
            ['nama' => 'Mohon diteliti'],
            ['nama' => 'Mohon pendapat'],
            ['nama' => 'Mohon saran'],
            ['nama' => 'Segera ditindaklanjuti'],
            ['nama' => 'Harap diperhatikan'],
            ['nama' => 'Untuk dilaksanakan'],
            ['nama' => 'Untuk evaluasi'],
        ];

        foreach ($refDisposisiData as $data) {
            RefDisposisi::create($data);
        }
    }
}
