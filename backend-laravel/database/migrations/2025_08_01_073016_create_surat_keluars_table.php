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
        Schema::create('surat_keluars', function (Blueprint $table) {
            $table->id('id_surat');
            $table->string('perihal');
            $table->string('tujuan');
            $table->string('no_urut');
            $table->string('no_surat');
            $table->string('kode_jenis');
            $table->string('kode_klasifikasi');
            $table->string('kode_penandatanganan');
            $table->date('tgl_surat');
            $table->date('tgl_catat')->nullable();
            $table->string('file')->nullable();
            $table->unsignedBigInteger('id_user');
            $table->string('kode_uk');
            $table->text('drafsurat')->nullable();
            $table->unsignedBigInteger('ref_surat_masuk')->nullable();
            $table->string('status')->default('proses');
            $table->timestamp('created')->nullable();
            $table->string('createdby')->nullable();
            $table->timestamp('updated')->nullable();
            $table->string('updatedby')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('surat_keluars');
    }
};