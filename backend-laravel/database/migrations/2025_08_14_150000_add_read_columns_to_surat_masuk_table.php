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
        Schema::table('surat_masuk', function (Blueprint $table) {
            // Track read status separately from workflow status
            $table->timestamp('read_at')->nullable()->after('status');
            $table->foreignId('read_by')->nullable()->after('read_at')->constrained('users')->nullOnDelete();

            // Helpful indexes for querying unread/read states
            $table->index(['status']);
            $table->index(['read_at']);
            $table->index(['read_by']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surat_masuk', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['read_at']);
            $table->dropIndex(['read_by']);
            $table->dropConstrainedForeignId('read_by');
            $table->dropColumn('read_at');
        });
    }
};
