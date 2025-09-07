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
        Schema::create('lembar_pantaus', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_surat');
            $table->unsignedBigInteger('id_jabatan');
            $table->text('catatan')->nullable();
            $table->date('tgl_paraf');
            $table->date('tgl_input');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lembar_pantaus');
    }
};
