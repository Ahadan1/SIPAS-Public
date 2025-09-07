<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'Dibaca' to ENUM list for surat_masuk.status if using MySQL
        // Note: This uses raw SQL; ensure your connection is MySQL-compatible.
        DB::statement("ALTER TABLE `surat_masuk` MODIFY `status` ENUM('Diterima','Dibaca','Didisposisikan','Diarsipkan') NOT NULL DEFAULT 'Diterima'");
    }

    public function down(): void
    {
        // Revert by removing 'Dibaca' from ENUM
        DB::statement("ALTER TABLE `surat_masuk` MODIFY `status` ENUM('Diterima','Didisposisikan','Diarsipkan') NOT NULL DEFAULT 'Diterima'");
    }
};
