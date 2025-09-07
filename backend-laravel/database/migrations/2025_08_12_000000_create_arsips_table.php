<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('arsips', function (Blueprint $table) {
            $table->id();
            $table->string('surat_type'); // morph type: App\Models\SuratMasuk | App\Models\SuratKeluar
            $table->unsignedBigInteger('surat_id'); // morph id
            $table->string('unit_kerja', 50)->nullable();
            $table->string('lokasi_fisik', 100)->nullable();
            $table->text('keterangan')->nullable();
            $table->foreignId('archived_by')->constrained('users');
            $table->timestamp('archived_at');
            $table->timestamps();

            $table->unique(['surat_type', 'surat_id']);
            $table->index(['surat_type', 'surat_id']);
            $table->index('archived_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('arsips');
    }
};
