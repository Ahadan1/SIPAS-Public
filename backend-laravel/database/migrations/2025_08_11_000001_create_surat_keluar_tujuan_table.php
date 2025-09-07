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
        Schema::create('surat_keluar_tujuan', function (Blueprint $table) {
            $table->id();
            // references SuratKeluar primary key id_surat
            $table->unsignedBigInteger('surat_keluar_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            $table->foreign('surat_keluar_id')
                ->references('id_surat')
                ->on('surat_keluars')
                ->onDelete('cascade');

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->unique(['surat_keluar_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_keluar_tujuan');
    }
};
