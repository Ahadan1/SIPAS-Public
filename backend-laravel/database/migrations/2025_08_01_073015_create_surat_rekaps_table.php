<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('surat_rekaps', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('tahun');
            $table->string('file_upload')->nullable();
            $table->unsignedBigInteger('id_user');
            $table->string('kode_uk');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_rekaps');
    }
};
