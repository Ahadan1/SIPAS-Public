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
        // Older table name: tembusan
        if (Schema::hasTable('tembusan')) {
            Schema::table('tembusan', function (Blueprint $table) {
                if (!Schema::hasColumn('tembusan', 'read_at')) {
                    $table->timestamp('read_at')->nullable()->after('jabatan_id');
                }
                if (!Schema::hasColumn('tembusan', 'read_by')) {
                    $table->foreignId('read_by')->nullable()->after('read_at')->constrained('users')->nullOnDelete();
                }
                $table->index(['read_at']);
                $table->index(['read_by']);
            });
        }

        // Newer table name: tembusans
        if (Schema::hasTable('tembusans')) {
            Schema::table('tembusans', function (Blueprint $table) {
                if (!Schema::hasColumn('tembusans', 'read_at')) {
                    $table->timestamp('read_at')->nullable()->after('jabatan_id');
                }
                if (!Schema::hasColumn('tembusans', 'read_by')) {
                    $table->foreignId('read_by')->nullable()->after('read_at')->constrained('users')->nullOnDelete();
                }
                $table->index(['read_at']);
                $table->index(['read_by']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('tembusan')) {
            Schema::table('tembusan', function (Blueprint $table) {
                if (Schema::hasColumn('tembusan', 'read_by')) {
                    $table->dropIndex(['read_by']);
                    $table->dropConstrainedForeignId('read_by');
                }
                if (Schema::hasColumn('tembusan', 'read_at')) {
                    $table->dropIndex(['read_at']);
                    $table->dropColumn('read_at');
                }
            });
        }
        if (Schema::hasTable('tembusans')) {
            Schema::table('tembusans', function (Blueprint $table) {
                if (Schema::hasColumn('tembusans', 'read_by')) {
                    $table->dropIndex(['read_by']);
                    $table->dropConstrainedForeignId('read_by');
                }
                if (Schema::hasColumn('tembusans', 'read_at')) {
                    $table->dropIndex(['read_at']);
                    $table->dropColumn('read_at');
                }
            });
        }
    }
};
