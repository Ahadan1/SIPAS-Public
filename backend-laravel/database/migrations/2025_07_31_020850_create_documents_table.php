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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_surat')->unique();
            $table->string('perihal');
            $table->date('tanggal_surat');
            $table->foreignId('jenis_naskah_id')->constrained('jenis_naskah');
            $table->foreignId('klasifikasi_id')->constrained('klasifikasi');
            $table->foreignId('user_id')->comment('User who created the document')->constrained('users');
            $table->enum('sifat_keamanan', ['Biasa', 'Rahasia', 'Sangat Rahasia']);
            $table->enum('sifat_kecepatan', ['Biasa', 'Segera', 'Sangat Segera']);
            $table->text('ringkasan')->nullable();
            $table->string('file_path');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
